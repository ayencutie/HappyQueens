// Admin login — front-end demo only, no real authentication/session yet.
// Demo credential pair so the flow feels real: admin@happyqueens.com / admin123

const ADMIN_DEMO_EMAIL = 'admin@happyqueens.com';
const ADMIN_DEMO_PASSWORD = 'admin123';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const errorMsg = document.getElementById('adminLoginError');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (email === ADMIN_DEMO_EMAIL && password === ADMIN_DEMO_PASSWORD) {
      errorMsg.classList.remove('is-visible');
      window.location.href = 'admin-dashboard.html';
    } else {
      errorMsg.classList.add('is-visible');
    }
  });
});
