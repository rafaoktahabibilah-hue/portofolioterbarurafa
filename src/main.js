/* ============================================
   MERCURY — Portfolio Interactions
   ============================================ */

// --- Navigation scroll effect ---
var nav = document.getElementById('nav');
function handleNavScroll() {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

// --- Mobile nav toggle ---
var navToggle = document.getElementById('navToggle');
var navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', function() {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-link').forEach(function(link) {
  link.addEventListener('click', function() {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// --- Scroll reveal ---
var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(function(el) {
  revealObserver.observe(el);
});

// --- Add reveal class to sections dynamically ---
function initRevealElements() {
  var selectors = [
    '.section-label',
    '.section-title',
    '.card',
    '.project-card',
    '.skill-card',
    '.service-card',
    '.achievement-card',
    '.testimonial-card',
    '.timeline-item',
    '.contact-card',
    '.contact-text',
    '.contact-form',
    '.contact-links'
  ];

  selectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        revealObserver.observe(el);
      }
    });
  });
}

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- Init ---
document.addEventListener('DOMContentLoaded', initRevealElements);

// --- YouTube Music Player ---
var musicPlayerContainer = document.getElementById('musicPlayer');
var musicTrigger = document.getElementById('musicTrigger');
var ytPlayer = null;
var isMusicPlaying = false;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('musicPlayer', {
    videoId: 'rVri8U-geqY',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0
    },
    events: {
      onReady: function() {
        console.log('YouTube player ready');
      }
    }
  });
}

// Global function for YouTube API
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

musicTrigger.addEventListener('click', function() {
  if (!isMusicPlaying && ytPlayer) {
    ytPlayer.unmute();
    ytPlayer.playVideo();
    isMusicPlaying = true;
    musicTrigger.classList.add('playing');
  } else if (isMusicPlaying && ytPlayer) {
    ytPlayer.mute();
    ytPlayer.pauseVideo();
    isMusicPlaying = false;
    musicTrigger.classList.remove('playing');
  }
});

// Show hide when tab/window change
window.addEventListener('visibilitychange', function() {
  if (ytPlayer && isMusicPlaying) {
    if (document.hidden) {
      ytPlayer.mute();
    } else {
      ytPlayer.unmute();
    }
  }
});
