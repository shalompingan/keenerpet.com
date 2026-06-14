// KeenerPet — Responsive Navigation
(function () {
  'use strict';

  // --- Mobile Sidebar ---
  var hamburger = document.querySelector('.hamburger');
  var sidebar = document.querySelector('.mobile-sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  var closeBtn = document.querySelector('.sidebar-close');

  function openSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  // --- Desktop Dropdown (click fallback for touch) ---
  var navGroups = document.querySelectorAll('.desktop-nav .nav-group');
  navGroups.forEach(function (group) {
    var trigger = group.querySelector('.nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      var isOpen = group.classList.contains('open');
      navGroups.forEach(function (g) { g.classList.remove('open'); });
      if (!isOpen) group.classList.add('open');
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.desktop-nav')) {
      navGroups.forEach(function (g) { g.classList.remove('open'); });
    }
  });

  // --- Auto-highlight current page ---
  var currentPath = window.location.pathname;
  if (!currentPath.endsWith('/')) currentPath += '/';

  document.querySelectorAll('.dropdown-item, .sidebar-section a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });
})();
