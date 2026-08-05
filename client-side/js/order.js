// Log In modal — shared behavior across all pages

function openLoginModal() {
  const overlay = document.getElementById('loginModalOverlay');
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.classList.add('modal-open');
  const firstInput = document.getElementById('loginIdentifier');
  if (firstInput) firstInput.focus();
}

function closeLoginModal() {
  const overlay = document.getElementById('loginModalOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}

document.addEventListener('DOMContentLoaded', function () {
  const loginTrigger = document.getElementById('loginNavBtn');
  const overlay = document.getElementById('loginModalOverlay');
  const closeBtn = document.getElementById('loginModalClose');
  const form = document.getElementById('loginModalForm');
  const googleBtn = document.getElementById('googleModalLoginBtn');
  const registerBtn = document.getElementById('goToRegisterBtn');

  if (loginTrigger) {
    loginTrigger.addEventListener('click', openLoginModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLoginModal);
  }

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLoginModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLoginModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const identifier = document.getElementById('loginIdentifier').value.trim();
      const password = document.getElementById('loginModalPassword').value.trim();

      if (!identifier || !password) {
        alert('Please enter your email or phone number, and your password.');
        return;
      }

      // Front-end only: no real authentication yet, just completes the flow
      alert('Logged in! (front-end demo only)');
      form.reset();
      closeLoginModal();
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', function () {
      alert('Logged in with Google! (front-end demo only)');
      closeLoginModal();
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', function () {
      window.location.href = '../html/register.html';
    });
  }
});

//PREVIEWWWWWWWW

const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const previewText = document.getElementById("previewText");

fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        preview.src = e.target.result;
        preview.style.display = "block";
        previewText.style.display = "none";

    };

    reader.readAsDataURL(file);

});