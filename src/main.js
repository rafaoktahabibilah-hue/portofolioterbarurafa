const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window)

const canvas = document.getElementById('crystal-canvas')
const ctx = isMobile ? null : canvas.getContext('2d')
const hero = document.getElementById('hero')
const heroL = document.getElementById('hero-left')
const heroR = document.getElementById('hero-right')
const scrollInd = document.getElementById('scroll-indicator')
const smokeBg = document.getElementById('smoke-bg')
const aboutSection = document.querySelector('.section-about')
const counterEl = document.getElementById('counter')
const pageOverlay = document.getElementById('page-overlay')
const cursorDot = isMobile ? null : document.getElementById('cursor')
const cursorRing = isMobile ? null : document.getElementById('cursor-ring')

if (isMobile) {
  canvas.style.display = 'none'
  heroL.style.cssText = 'position:static;transform:none;text-align:center;margin-bottom:8px;font-size:42px'
  heroR.style.cssText = 'position:static;transform:none;text-align:center;font-size:42px'
  hero.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;height:100vh'
}

let W, H, cx, cy
let angle = 0
let state = 'idle'
let shatterTriggered = false
let aboutTriggered = false
let counterTriggered = false
let shatterParticles = []
let smokeParticles = []
let shakeTick = 0
let smokeSpawnTimer = 0
let smokeSpawnUntil = 0
let aboutDelay = 0

function resize() {
  W = hero.offsetWidth
  H = hero.offsetHeight
  if (!isMobile) {
    canvas.width = W
    canvas.height = H
  }
  cx = W / 2
  cy = H / 2
}
resize()
window.addEventListener('resize', resize)

const CRYSTAL_FACETS = [
  { pts: [{x:0,y:-80},{x:40,y:-20},{x:0,y:10}], brightness: 1.0 },
  { pts: [{x:0,y:-80},{x:-40,y:-20},{x:0,y:10}], brightness: 0.7 },
  { pts: [{x:40,y:-20},{x:60,y:40},{x:0,y:10}], brightness: 0.85 },
  { pts: [{x:-40,y:-20},{x:-60,y:40},{x:0,y:10}], brightness: 0.55 },
  { pts: [{x:60,y:40},{x:0,y:80},{x:0,y:10}], brightness: 0.75 },
  { pts: [{x:-60,y:40},{x:0,y:80},{x:0,y:10}], brightness: 0.65 },
  { pts: [{x:40,y:-20},{x:0,y:-5},{x:60,y:40}], brightness: 0.55 },
  { pts: [{x:-40,y:-20},{x:0,y:-5},{x:-60,y:40}], brightness: 0.45 },
]

function rotatePt(p, ang) {
  return {
    x: p.x * Math.cos(ang) - p.y * Math.sin(ang),
    y: p.x * Math.sin(ang) + p.y * Math.cos(ang),
  }
}

function drawFacet(ctx, pts, brightness, offsetX = 0, offsetY = 0, alpha = 1, extraAngle = 0) {
  const dark = Math.floor(brightness * 30)
  const light = Math.floor(brightness * 200)

  ctx.beginPath()
  for (let i = 0; i < pts.length; i++) {
    const rp = rotatePt(pts[i], extraAngle)
    const sx = cx + rp.x + offsetX
    const sy = cy + rp.y + offsetY
    if (i === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  }
  ctx.closePath()

  ctx.fillStyle = `rgba(${dark}, ${dark}, ${dark + 8}, ${alpha})`
  ctx.fill()
  ctx.strokeStyle = `rgba(${light}, ${light}, ${light + 20}, ${0.9 * alpha})`
  ctx.lineWidth = 0.8
  ctx.stroke()

  const p0 = rotatePt(pts[0], extraAngle)
  const p1 = rotatePt(pts[1], extraAngle)
  const hx = p0.x + (p1.x - p0.x) * 0.4
  const hy = p0.y + (p1.y - p0.y) * 0.4
  ctx.beginPath()
  ctx.moveTo(cx + p0.x + offsetX, cy + p0.y + offsetY)
  ctx.lineTo(cx + hx + offsetX, cy + hy + offsetY)
  ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.5 * alpha})`
  ctx.lineWidth = 1.2
  ctx.stroke()
}

function drawCrystal(ang) {
  CRYSTAL_FACETS.forEach((f) => {
    drawFacet(ctx, f.pts, f.brightness, 0, 0, 1, ang)
  })
}

function drawParticles() {
  shatterParticles = shatterParticles.filter((p) => p.alpha > 0)
  shatterParticles.forEach((p) => {
    p.vx *= p.drag
    p.vy *= p.drag
    p.vy += p.gravity
    p.x += p.vx
    p.y += p.vy
    p.alpha -= 0.012
    p.rotAngle += p.rotSpeed

    if (p.alpha <= 0) return

    ctx.save()
    const pts = p.pts.map((pt) => rotatePt(pt, p.rotAngle))
    ctx.beginPath()
    for (let i = 0; i < pts.length; i++) {
      const sx = p.x + pts[i].x
      const sy = p.y + pts[i].y
      if (i === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    }
    ctx.closePath()

    const dark = Math.floor(p.brightness * 30)
    const light = Math.floor(p.brightness * 200)
    ctx.fillStyle = `rgba(${dark}, ${dark}, ${dark + 8}, ${p.alpha})`
    ctx.fill()
    ctx.strokeStyle = `rgba(${light}, ${light}, ${light + 20}, ${0.9 * p.alpha})`
    ctx.lineWidth = 0.6
    ctx.stroke()
    ctx.restore()
  })
}

function drawSmoke() {
  smokeParticles.forEach((s) => {
    s.x += s.vx
    s.y += s.vy
    s.radius += s.growth
    s.alpha -= 0.0008
    if (s.alpha <= 0.005 || s.radius > 200) return

    ctx.beginPath()
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(120, 80, 160, ${Math.max(0, s.alpha)})`
    ctx.fill()
  })
  smokeParticles = smokeParticles.filter((s) => s.alpha > 0.005 && s.radius <= 200)
}

function spawnSmoke() {
  for (let i = 0; i < 6; i++) {
    smokeParticles.push({
      x: cx + (Math.random() - 0.5) * 160,
      y: cy + (Math.random() - 0.5) * 160,
      radius: 20 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.3 - Math.random() * 0.5,
      growth: 0.5 + Math.random() * 0.8,
      alpha: 0.08 + Math.random() * 0.1,
    })
  }
}

function spawnShatter() {
  CRYSTAL_FACETS.forEach((facet) => {
    const cxCentroid = facet.pts.reduce((s, p) => s + p.x, 0) / facet.pts.length
    const cyCentroid = facet.pts.reduce((s, p) => s + p.y, 0) / facet.pts.length
    const dir = Math.atan2(cyCentroid, cxCentroid) + (Math.random() - 0.5) * 0.8
    const speed = 2 + Math.random() * 4

    shatterParticles.push({
      x: cx,
      y: cy,
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      gravity: 0.08 + Math.random() * 0.04,
      drag: 0.98,
      alpha: 1,
      rotAngle: 0,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      brightness: facet.brightness,
      pts: facet.pts,
    })

    for (let d = 0; d < 3; d++) {
      const ddir = Math.random() * Math.PI * 2
      const dspeed = 3 + Math.random() * 5
      shatterParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(ddir) * dspeed,
        vy: Math.sin(ddir) * dspeed,
        gravity: 0.1 + Math.random() * 0.03,
        drag: 0.97,
        alpha: 1,
        rotAngle: 0,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        brightness: facet.brightness * 0.5,
        pts: [
          {x: 0, y: -6},
          {x: 6, y: 4},
          {x: -6, y: 4},
        ],
      })
    }
  })
}

function triggerShatter() {
  if (shatterTriggered) return
  shatterTriggered = true
  state = 'shattered'
  smokeSpawnUntil = performance.now() + 2000
  smokeBg.classList.add('active')
  scrollInd.style.opacity = '0'
  heroL.classList.add('scatter')
  heroR.classList.add('scatter')
  spawnShatter()
  aboutDelay = performance.now() + 700
}

let scrollHandled = false
let prevScrollY = 0
window.addEventListener('scroll', () => {
  prevScrollY = window.scrollY
  if (window.scrollY > 60 && !scrollHandled) {
    scrollHandled = true
    if (isMobile) {
      scrollInd.style.opacity = '0'
      aboutSection.classList.add('visible')
      aboutTriggered = true
      aboutDelay = performance.now()
      animateCounter()
      smokeBg.classList.add('active')
      heroL.classList.add('scatter')
      heroR.classList.add('scatter')
      return
    }
    state = 'shaking'
    shakeTick = 0
    const shakeInterval = setInterval(() => {
      angle += 0.08
      shakeTick++
      if (shakeTick >= 10) {
        clearInterval(shakeInterval)
        triggerShatter()
      }
    }, 30)
  }
}, { passive: true })

function animate(timestamp) {
  if (!isMobile) {
    ctx.clearRect(0, 0, W, H)

    if (state === 'idle') {
      angle += 0.012
      drawCrystal(angle)
    } else if (state === 'shaking') {
      drawCrystal(angle)
    } else if (state === 'shattered') {
      drawParticles()
      if (timestamp < smokeSpawnUntil && timestamp - smokeSpawnTimer > 120) {
        spawnSmoke()
        smokeSpawnTimer = timestamp
      }
      drawSmoke()
    }
  }

  if (aboutDelay && timestamp > aboutDelay && !aboutTriggered) {
    aboutTriggered = true
    aboutSection.classList.add('visible')
  }

  if (aboutTriggered && !counterTriggered) {
    counterTriggered = true
    animateCounter()
  }

  requestAnimationFrame(animate)
}

function animateCounter() {
  const start = performance.now()
  const duration = 1400
  function tick(ts) {
    const elapsed = ts - start
    const p = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    const val = Math.round(eased * 8)
    counterEl.textContent = '+' + val
    if (elapsed < duration) requestAnimationFrame(tick)
    else counterEl.textContent = '+8'
  }
  requestAnimationFrame(tick)
}

let mouseX = -100, mouseY = -100
let ringX = -100, ringY = -100

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px'
    cursorDot.style.top = mouseY + 'px'
  }
}, { passive: true })

function animateCursor() {
  ringX += (mouseX - ringX) * 0.1
  ringY += (mouseY - ringY) * 0.1
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px'
    cursorRing.style.top = ringY + 'px'
  }
  requestAnimationFrame(animateCursor)
}

setTimeout(() => {
  pageOverlay.classList.add('hidden')
}, 300)

setTimeout(() => {
  const el = pageOverlay
  el.addEventListener('transitionend', () => { if (el.classList.contains('hidden')) el.style.display = 'none' })
}, 300)

const skills = [
  { name: 'Unity', color: '#4A9EFF' },
  { name: 'C#', color: '#9C72FF' },
  { name: 'Blender', color: '#3DD6F5' },
  { name: 'Godot', color: '#478CBF' },
  { name: 'Python', color: '#306998' },
  { name: 'JavaScript', color: '#F7DF1E' },
  { name: 'HTML/CSS', color: '#E34C26' },
  { name: 'Game Design', color: '#FF6B6B' },
  { name: 'AI Tools', color: '#A8FF78' },
  { name: 'Video Editing', color: '#FF4081' },
  { name: 'Content Creation', color: '#00C853' },
  { name: 'Git', color: '#F05032' },
  { name: 'Figma', color: '#A259FF' },
  { name: 'Photoshop', color: '#31A8FF' },
]

const projects = [
  { title: 'AI Game Jam Project', desc: 'Game yang dikembangkan menggunakan teknologi AI untuk GDC Maret 2026.', tags: ['AI', 'Game Dev', 'Unity'], icon: '🤖' },
  { title: 'Platformer 2D', desc: 'Game platformer 2D dengan mekanik unik dan level design yang menantang.', tags: ['Unity', 'C#', '2D'], icon: '🕹️' },
  { title: 'Visual Novel', desc: 'Cerita interaktif dengan branching narrative dan karakter original.', tags: ['RenPy', 'Python', 'Story'], icon: '📖' },
]

const platforms = [
  { name: 'YouTube', niche: 'Game Dev Tutorial', icon: '▶️', url: '#' },
  { name: 'TikTok (@Microxx6)', niche: 'Game Dev & Konten Kreatif', icon: '🎵', url: 'https://tiktok.com/@Microxx6' },
  { name: 'Instagram', niche: 'Dev Journey', icon: '📷', url: '#' },
]

function renderSkills() {
  const grid = document.getElementById('skillsGrid')
  skills.forEach((s) => {
    const el = document.createElement('span')
    el.className = 'skill-item'
    el.innerHTML = `<span class="skill-dot" style="background:${s.color}"></span>${s.name}`
    grid.appendChild(el)
  })
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid')
  projects.forEach((p) => {
    const el = document.createElement('div')
    el.className = 'project-card'
    el.innerHTML = `<div class="project-thumb">${p.icon}</div><div class="project-body"><h3>${p.title}</h3><p>${p.desc}</p><div class="project-tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div><div class="project-links"><a href="#">Demo</a><a href="#">Source</a></div></div>`
    grid.appendChild(el)
  })
}

function renderContent() {
  const grid = document.getElementById('contentGrid')
  platforms.forEach((p) => {
    const el = document.createElement('div')
    el.className = 'content-card'
    el.innerHTML = `<div class="content-card-header"><span class="content-card-icon">${p.icon}</span><span>${p.name}</span></div><p>${p.niche}</p><a href="${p.url}" target="_blank" rel="noopener">Kunjungi</a>`
    grid.appendChild(el)
  })
}

const form = document.getElementById('contactForm')
const submitBtn = document.getElementById('submitBtn')
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const orig = submitBtn.textContent
  submitBtn.textContent = 'Terkirim!'
  submitBtn.style.pointerEvents = 'none'
  setTimeout(() => {
    submitBtn.textContent = orig
    submitBtn.style.pointerEvents = 'auto'
    form.reset()
  }, 2000)
})

renderSkills()
renderProjects()
renderContent()
if (!isMobile) {
  requestAnimationFrame(animate)
  requestAnimationFrame(animateCursor)
}
