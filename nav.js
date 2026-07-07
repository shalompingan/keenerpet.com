// KeenerPet — Responsive Navigation
(function () {
  'use strict';

  // --- Mobile Side Panel ---
  var hamburger = document.querySelector('.hamburger');
  var panel = document.querySelector('.side-panel');
  var overlay = document.querySelector('.side-overlay');
  var closeBtn = document.querySelector('.sp-close');

  function openPanel() {
    if (!panel || !overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    if (!panel || !overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  // --- Auto-highlight current page ---
  var currentPath = window.location.pathname;
  if (!currentPath.endsWith('/')) currentPath += '/';

  document.querySelectorAll('.side-panel a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });
})();
