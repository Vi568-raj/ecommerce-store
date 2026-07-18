/* ==========================================================================
   auth.js — Handles the Login and Register forms, including client-side
   validation before hitting the API.
   ========================================================================== */

function setFieldError(inputEl, message) {
  const group = inputEl.closest('.form-group');
  if (!group) return;
  group.classList.add('invalid');
  const errEl = group.querySelector('.field-error');
  if (errEl) errEl.textContent = message;
}

function clearFieldError(inputEl) {
  const group = inputEl.closest('.form-group');
  if (!group) return;
  group.classList.remove('invalid');
}

function clearAllErrors(form) {
  if (!form) return;
  form.querySelectorAll('.form-group').forEach((g) => {
    g.classList.remove('invalid');
    const errEl = g.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
  });
}

/* ---------------- Register form ---------------- */
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(registerForm);

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    let valid = true;

    if (name.value.trim().length < 2) {
      setFieldError(name, 'Please enter your full name');
      valid = false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
      setFieldError(email, 'Please enter a valid email address');
      valid = false;
    }
    if (password.value.length < 6) {
      setFieldError(password, 'Password must be at least 6 characters');
      valid = false;
    }
    if (confirmPassword.value !== password.value) {
      setFieldError(confirmPassword, 'Passwords do not match');
      valid = false;
    }

    if (!valid) return;

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name: name.value.trim(), email: email.value.trim(), password: password.value },
      });
      Auth.save(data.token, data.user);
      showToast('Account created! Welcome to UrbanCart.', 'success');
      setTimeout(() => (window.location.href = 'index.html'), 700);
    } catch (err) {
      showToast(err.message, 'error');
      if (err.errors) {
        err.errors.forEach((fe) => {
          const el = registerForm.querySelector(`[name="${fe.field}"]`) || registerForm.elements[fe.field];
          if (el) setFieldError(el, fe.message);
        });
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

/* ---------------- Login form ---------------- */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(loginForm);

    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let valid = true;
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
      setFieldError(email, 'Please enter a valid email address');
      valid = false;
    }
    if (!password.value) {
      setFieldError(password, 'Password is required');
      valid = false;
    }
    if (!valid) return;

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email: email.value.trim(), password: password.value },
      });
      Auth.save(data.token, data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      setTimeout(() => (window.location.href = redirect || 'index.html'), 600);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });
}

/* Redirect already-logged-in users away from login/register pages */
document.addEventListener('DOMContentLoaded', () => {
  if ((loginForm || registerForm) && Auth.isLoggedIn()) {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    window.location.href = redirect || 'index.html';
  }
});
