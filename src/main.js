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
    '.achievement-featured',
    '.testimonial-card',
    '.timeline-item',
    '.contact-card',
    '.contact-text',
    '.contact-form',
    '.contact-links',
    '.about-photo',
    '.about-bio'
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
