// Forgot Password — email or phone OTP flow (front-end demo only, no real backend)

document.addEventListener('DOMContentLoaded', function () {
  const methodEmailBtn = document.getElementById('methodEmailBtn');
  const methodPhoneBtn = document.getElementById('methodPhoneBtn');
  const emailField = document.getElementById('emailField');
  const phoneField = document.getElementById('phoneField');
  const recoveryEmail = document.getElementById('recoveryEmail');
  const recoveryPhone = document.getElementById('recoveryPhone');
  const requestForm = document.getElementById('requestForm');
  const requestError = document.getElementById('requestError');

  const stepRequest = document.getElementById('stepRequest');
  const stepOtp = document.getElementById('stepOtp');
  const otpTarget = document.getElementById('otpTarget');
  const otpForm = document.getElementById('otpForm');
  const otpInputs = document.querySelectorAll('#otpInputs input');
  const otpError = document.getElementById('otpError');
  const resendBtn = document.getElementById('resendCodeBtn');
  const changeMethodBtn = document.getElementById('changeMethodBtn');

  let currentMethod = 'email';

  // Basic validators
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidPhone = (value) => /^(09|\+639)\d{9}$/.test(value.replace(/[\s-]/g, ''));

  function setMethod(method) {
    currentMethod = method;
    const isEmail = method === 'email';

    methodEmailBtn.classList.toggle('is-active', isEmail);
    methodEmailBtn.setAttribute('aria-selected', String(isEmail));
    methodPhoneBtn.classList.toggle('is-active', !isEmail);
    methodPhoneBtn.setAttribute('aria-selected', String(!isEmail));

    emailField.style.display = isEmail ? '' : 'none';
    phoneField.style.display = isEmail ? 'none' : '';

    requestError.classList.remove('is-visible');
  }

  methodEmailBtn.addEventListener('click', () => setMethod('email'));
  methodPhoneBtn.addEventListener('click', () => setMethod('phone'));

  function showError(message) {
    requestError.textContent = message;
    requestError.classList.add('is-visible');
  }

  function maskEmail(value) {
    const [name, domain] = value.split('@');
    if (!name || !domain) return value;
    const visible = name.slice(0, Math.min(2, name.length));
    return `${visible}${'*'.repeat(Math.max(name.length - visible.length, 1))}@${domain}`;
  }

  function maskPhone(value) {
    const digits = value.replace(/[\s-]/g, '');
    return `${digits.slice(0, 4)} *** ${digits.slice(-3)}`;
  }

  requestForm.addEventListener('submit', function (e) {
    e.preventDefault();
    requestError.classList.remove('is-visible');

    if (currentMethod === 'email') {
      const value = recoveryEmail.value.trim();
      if (!isValidEmail(value)) {
        showError('Please enter a valid email address.');
        return;
      }
      otpTarget.textContent = maskEmail(value);
    } else {
      const value = recoveryPhone.value.trim();
      if (!isValidPhone(value)) {
        showError('Please enter a valid Philippine mobile number.');
        return;
      }
      otpTarget.textContent = maskPhone(value);
    }

    // Front-end only: pretend a code was sent
    stepRequest.style.display = 'none';
    stepOtp.style.display = '';
    otpError.classList.remove('is-visible');
    otpInputs.forEach((input) => (input.value = ''));
    otpInputs[0].focus();
  });

  // OTP auto-advance between boxes
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (this.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !this.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', function (e) {
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      if (!pasted) return;
      e.preventDefault();
      pasted.split('').slice(0, otpInputs.length).forEach((digit, i) => {
        otpInputs[i].value = digit;
      });
      const nextEmpty = Array.from(otpInputs).find((i) => !i.value);
      (nextEmpty || otpInputs[otpInputs.length - 1]).focus();
    });
  });

  otpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const code = Array.from(otpInputs).map((i) => i.value).join('');

    if (code.length < 6) {
      otpError.textContent = 'Please enter all 6 digits.';
      otpError.classList.add('is-visible');
      return;
    }

    // Front-end only: any complete 6-digit code is accepted as a demo
    otpError.classList.remove('is-visible');
    window.location.href = 'landing-page/html/reset-password.html';
  });

  resendBtn.addEventListener('click', function () {
    otpInputs.forEach((input) => (input.value = ''));
    otpInputs[0].focus();
    otpError.classList.remove('is-visible');
    alert('A new code has been sent. (front-end demo only)');
  });

  changeMethodBtn.addEventListener('click', function () {
    stepOtp.style.display = 'none';
    stepRequest.style.display = '';
  });
});
