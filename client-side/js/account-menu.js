// Account menu — logged-in navbar dropdown (front-end demo only)

document.addEventListener('DOMContentLoaded', function () {
  const accountMenu = document.getElementById('accountMenu');
  const accountMenuBtn = document.getElementById('accountMenuBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!accountMenu || !accountMenuBtn) return;

  function openMenu() {
    accountMenu.classList.add('is-open');
    accountMenuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    accountMenu.classList.remove('is-open');
    accountMenuBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    if (accountMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  accountMenuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', function (e) {
    if (!accountMenu.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      // Front-end only: no real session yet, just returns to the login page
      alert('Logged out! (front-end demo only)');
      window.location.href = 'index.html';
    });
  }
});
