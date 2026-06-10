const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window)
const pageOverlay = document.getElementById('page-overlay')
const cursorDot = isMobile ? null : document.getElementById('cursor')
const cursorRing = isMobile ? null : document.getElementById('cursor-ring')
const scrollBar = document.getElementById('scroll-bar')

setTimeout(() => pageOverlay.classList.add('hidden'), 200)

const ROLES = ['Game Dev', 'Vibe Coder', 'Content Creator']
let roleIdx = 0, charIdx = 0, deleting = false
const twEl = document.getElementById('typewriter')

function typewriter() {
  const current = ROLES[roleIdx]
  if (!deleting) {
    twEl.textContent = current.slice(0, charIdx + 1) + ' · '
    charIdx++
    if (charIdx === current.length) { deleting = true; setTimeout(typewriter, 2000); return }
    setTimeout(typewriter, 80)
  } else {
    twEl.textContent = current.slice(0, charIdx) + ' · '
    charIdx--
    if (charIdx < 0) {
      deleting = false; roleIdx = (roleIdx + 1) % ROLES.length; charIdx = 0
      setTimeout(typewriter, 400)
      return
    }
    setTimeout(typewriter, 40)
  }
}
typewriter()

const pCanvas = document.getElementById('particle-canvas')
const pCtx = isMobile ? null : pCanvas.getContext('2d')
let particles = []

function initParticles() {
  if (isMobile || !pCanvas) return
  pCanvas.width = window.innerWidth
  pCanvas.height = window.innerHeight
  particles = Array.from({ length: 40 }, () => ({
    x: Math.random() * pCanvas.width,
    y: Math.random() * pCanvas.height,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.4 + 0.1,
  }))
  animParticles()
}
function animParticles() {
  if (isMobile) return
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height)
  particles.forEach((p) => {
    p.x += p.vx; p.y += p.vy
    if (p.x < 0 || p.x > pCanvas.width) p.vx *= -1
    if (p.y < 0 || p.y > pCanvas.height) p.vy *= -1
    pCtx.beginPath()
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    pCtx.fillStyle = `rgba(168,85,247,${p.alpha})`
    pCtx.fill()
    pCtx.beginPath()
    pCtx.arc(p.x, p.y, p.r + 1.5, 0, Math.PI * 2)
    pCtx.fillStyle = `rgba(124,58,237,${p.alpha * 0.3})`
    pCtx.fill()
  })
  requestAnimationFrame(animParticles)
}
if (!isMobile) { initParticles(); window.addEventListener('resize', initParticles) }

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const els = entry.target.querySelectorAll('.reveal') || []
      if (entry.target.classList.contains('reveal')) {
        entry.target.classList.add('visible')
      }
      entry.target.querySelectorAll('.reveal').forEach((el, i) => {
        const d = parseFloat(el.dataset.delay || 0) + i * 0.08
        el.style.transitionDelay = d + 's'
        el.classList.add('visible')
      })
      revealObserver.unobserve(entry.target)
    }
  })
}, { threshold: 0.08 })

document.querySelectorAll('.section.reveal').forEach((s) => revealObserver.observe(s))
document.querySelectorAll('#hero .reveal').forEach((el) => {
  el.style.transitionDelay = (parseFloat(el.dataset.delay || 0)) + 's'
  el.classList.add('visible')
})

const navbar = document.getElementById('navbar')
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40)
  const scrollPercent = document.documentElement.scrollTop / (document.documentElement.scrollHeight - window.innerHeight) * 100
  scrollBar.style.width = Math.min(scrollPercent, 100) + '%'
}, { passive: true })

let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100
if (!isMobile) {
  document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY }, { passive: true })
  function animCursor() {
    cursorDot.style.left = mouseX + 'px'
    cursorDot.style.top = mouseY + 'px'
    ringX += (mouseX - ringX) * 0.08
    ringY += (mouseY - ringY) * 0.08
    cursorRing.style.left = ringX + 'px'
    cursorRing.style.top = ringY + 'px'
    requestAnimationFrame(animCursor)
  }
  requestAnimationFrame(animCursor)
}

const skillGroups = [
  {
    name: 'Languages',
    items: [
      { name: 'C#', color: '#9C72FF' },
      { name: 'Python', color: '#306998' },
      { name: 'JavaScript', color: '#F7DF1E' },
      { name: 'HTML/CSS', color: '#E34C26' },
    ],
  },
  {
    name: 'Game Dev Tools',
    items: [
      { name: 'Unity', color: '#a855f7' },
      { name: 'Godot', color: '#478CBF' },
      { name: 'Blender', color: '#c084fc' },
      { name: 'Game Design', color: '#FF6B6B' },
    ],
  },
  {
    name: 'Creative & AI',
    items: [
      { name: 'AI Tools', color: '#A8FF78' },
      { name: 'OpenRouter', color: '#7c3aed' },
      { name: 'HuggingFace', color: '#F59E0B' },
      { name: 'Video Editing', color: '#FF4081' },
      { name: 'Figma', color: '#A259FF' },
      { name: 'Photoshop', color: '#31A8FF' },
      { name: 'Git', color: '#F05032' },
    ],
  },
]

const projects = [
  { title: 'AI Game Jam Project', desc: 'Game berbasis AI untuk GDC Maret 2026. Eksplorasi LLM dalam gameplay.', tags: ['AI', 'Game Dev', 'Unity'], icon: '🤖', featured: true },
  { title: 'Platformer 2D', desc: 'Game platformer dengan mekanik unik & level design menantang.', tags: ['Unity', 'C#', '2D'], icon: '🕹️' },
  { title: 'Visual Novel', desc: 'Cerita interaktif dengan branching narrative & karakter original.', tags: ['RenPy', 'Python', 'Story'], icon: '📖' },
]

const blogPosts = [
  { tag: 'Game Dev', title: 'Apa yang Kupelajari dari AI Game Jam', date: 'Mar 2026', read: '4 min read' },
  { tag: 'Tutorial', title: 'Belajar Unity dari Nol Buat Project Sekolah', date: 'Feb 2026', read: '6 min read' },
  { tag: 'Thoughts', title: 'Kenapa Saya Pilih SMK Jurusan Gim', date: 'Jan 2026', read: '3 min read' },
]

function renderSkills() {
  const wrap = document.getElementById('skillsWrap')
  skillGroups.forEach((g) => {
    const cat = document.createElement('div')
    cat.className = 'skill-cat'
    cat.innerHTML = `<p class="skill-cat-name">${g.name}</p><div class="skill-cat-items"></div>`
    const items = cat.querySelector('.skill-cat-items')
    g.items.forEach((s) => {
      const el = document.createElement('span')
      el.className = 'skill-item'
      el.innerHTML = `<span class="skill-dot" style="background:${s.color}"></span>${s.name}`
      items.appendChild(el)
    })
    wrap.appendChild(cat)
  })
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid')
  projects.forEach((p) => {
    const card = document.createElement('div')
    card.className = 'bento-card' + (p.featured ? ' featured' : '')
    card.innerHTML = `<div class="bento-thumb">${p.icon}</div><div class="bento-body"><h3>${p.title}</h3><p>${p.desc}</p><div class="bento-tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div><a href="#" class="bento-cta">View Project <span>→</span></a></div>`
    grid.appendChild(card)
  })
}

function renderBlog() {
  const grid = document.getElementById('blogGrid')
  blogPosts.forEach((p) => {
    const card = document.createElement('div')
    card.className = 'blog-card'
    card.innerHTML = `<p class="blog-tag">${p.tag}</p><h3>${p.title}</h3><p class="blog-meta">${p.date} · ${p.read}</p><a href="#" class="blog-read">Read More <span>→</span></a>`
    grid.appendChild(card)
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
renderBlog()

document.querySelectorAll('.about-stats .stat-num').forEach((el, i) => {
  const target = parseInt(el.textContent) || 0
  const suffix = el.textContent.includes('+') ? '+' : ''
  let current = 0
  const observeAnim = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const start = performance.now()
      const dur = 1200 + i * 200
      function tick(ts) {
        const p = Math.min((ts - start) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = suffix + Math.round(eased * target)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      observeAnim.unobserve(el)
    }
  }, { threshold: 0.5 })
  observeAnim.observe(el)
})
