function setSheetTops() {
  document.querySelectorAll('main > section').forEach(function(s) {
    s.style.top = Math.min(0, window.innerHeight - s.offsetHeight) + 'px';
  });
}
window.addEventListener('resize', setSheetTops);
window.addEventListener('load', setSheetTops);
setSheetTops();

var rvObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      rvObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.rv').forEach(function(el) {
  rvObserver.observe(el);
});

var heroVisual = document.querySelector('.hero-visual');
var pickerBtns = document.querySelectorAll('.hero-visual .picker button');
pickerBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    heroVisual.style.setProperty('--duo-dark', btn.dataset.dark);
    heroVisual.style.setProperty('--duo-light', btn.dataset.light);
  });
});

var compare = document.querySelector('.grain .compare');
if (compare) {
  var dragging = false;
  var knob = compare.querySelector('.knob');
  var handle = compare.querySelector('.handle');
  var topLayer = compare.querySelector('.top');

  function setCut(clientX) {
    var rect = compare.getBoundingClientRect();
    var pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    compare.style.setProperty('--cut', pct + '%');
  }

  knob.addEventListener('pointerdown', function(e) {
    dragging = true;
    knob.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointerdown', function(e) {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });
  document.addEventListener('pointermove', function(e) {
    if (dragging) setCut(e.clientX);
  });
  document.addEventListener('pointerup', function() {
    dragging = false;
  });
}

if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}
