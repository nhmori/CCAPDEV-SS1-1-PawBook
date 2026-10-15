(function () {

  try {
    if (localStorage.getItem('pawbook_logged_in') === 'true' && localStorage.getItem('pawbook_role') === 'business' &&
        !/business-owner\.html$/.test(window.location.pathname)) {
      window.location.replace('business-owner.html');
    }
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', function () {

  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-bs-theme', savedTheme);

  function updateIcon() {
    if (!themeToggle) return;
    const current = html.getAttribute('data-bs-theme');
    themeToggle.textContent = current === 'dark' ? '☀️' : '🌙';
  }

  updateIcon();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = html.getAttribute('data-bs-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-bs-theme', next);
      localStorage.setItem('theme', next);
      updateIcon();
    });
  }

  
  const LOGIN_KEY = 'pawbook_logged_in';

  const ROLE_KEY = 'pawbook_role'; 
  const USERS_KEY = 'pawbook_users';
  const isBusiness = localStorage.getItem(LOGIN_KEY) === 'true' && localStorage.getItem(ROLE_KEY) === 'business';

  
  function users() {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) {}
    if (!list.some(function (u) { return u.email === 'juan@example.com'; })) {
      list.unshift({ name: 'Juan Dela Cruz', email: 'juan@example.com', password: 'password123', role: 'owner' });
    }
    return list;
  }
  function saveUsers(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
  function showMsg(id, type, text) {
    const box = document.getElementById(id);
    if (box) box.innerHTML = '<div class="alert alert-' + type + ' small py-2" role="alert"></div>';
    if (box) box.firstChild.textContent = text;
  }

  // Sign up
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('suName').value.trim();
      const email = document.getElementById('suEmail').value.trim().toLowerCase();
      const pass = document.getElementById('suPass').value;
      const pass2 = document.getElementById('suPass2').value;
      const role = document.getElementById('suRole').value;
      if (!name || !email) { showMsg('signupMsg', 'danger', 'Enter your name and email.'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showMsg('signupMsg', 'danger', 'Enter a valid email address.'); return; }
      if (pass.length < 8) { showMsg('signupMsg', 'danger', 'Password must be at least 8 characters.'); return; }
      if (pass !== pass2) { showMsg('signupMsg', 'danger', 'Passwords do not match.'); return; }
      const list = users();
      if (list.some(function (u) { return u.email === email; })) { showMsg('signupMsg', 'danger', 'An account with that email already exists.'); return; }
      list.push({ name: name, email: email, password: pass, role: role });
      saveUsers(list);
   
      localStorage.setItem(LOGIN_KEY, 'true');
      localStorage.setItem(ROLE_KEY, role);
      if (role === 'owner') localStorage.setItem('pawbook_account', JSON.stringify({ name: name, email: email }));
      window.location.href = role === 'business' ? 'business-owner.html' : 'index.html';
    });
  }

  // Log in
  const loginForm = document.querySelector('#login form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('liEmail').value.trim().toLowerCase();
      const pass = document.getElementById('liPass').value;
      const picked = loginForm.querySelector('input[name="role"]:checked');
      const role = picked ? picked.value : 'owner';
      if (!email || !pass) { showMsg('loginMsg', 'danger', 'Enter your email and password.'); return; }
      // No credential check (mock): the account type chosen above decides where you land.
      const known = users().filter(function (u) { return u.email === email; })[0];
      localStorage.setItem(LOGIN_KEY, 'true');
      localStorage.setItem(ROLE_KEY, role);
      if (role === 'owner') {
        localStorage.setItem('pawbook_account', JSON.stringify({ name: known ? known.name : email.split('@')[0], email: email }));
      }
      window.location.href = role === 'business' ? 'business-owner.html' : (role === 'admin' ? 'admin-dashboard.html' : 'index.html');
    });
  }


  if (isBusiness) {
    const brand = document.querySelector('.navbar-brand');
    if (brand) brand.setAttribute('href', 'business-owner.html');
    const navList = document.querySelector('.navbar-nav');
    if (navList) navList.innerHTML = '';
  }


  if (localStorage.getItem(LOGIN_KEY) === 'true') {
    const authLinks = document.querySelectorAll('.navbar a[href="login-signup.html"]');
    if (authLinks.length) {
      const container = authLinks[0].parentElement;
      authLinks.forEach(function (a) { a.remove(); });

      const logoutBtn = document.createElement('button');
      logoutBtn.type = 'button';
      logoutBtn.className = 'btn btn-outline-dark btn-sm';
      logoutBtn.textContent = 'LOG OUT';
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem(LOGIN_KEY);
        localStorage.removeItem(ROLE_KEY);
        window.location.href = 'index.html';
      });
      container.insertBefore(logoutBtn, container.firstChild);


      const petsBtn = document.createElement('a');
      const isAdmin = localStorage.getItem(ROLE_KEY) === 'admin';
      petsBtn.href = isAdmin ? 'admin-dashboard.html' : 'my-dashboard.html';
      petsBtn.className = 'btn btn-outline-dark btn-sm d-flex align-items-center';
      petsBtn.title = isBusiness ? 'My business' : 'My account';
      petsBtn.setAttribute('aria-label', isBusiness ? 'My business' : 'My account');
      petsBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">' +
        '<path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>' +
        '</svg>';
      if (/(my-dashboard|my-pets|business-owner|admin-dashboard)\.html$/.test(window.location.pathname)) petsBtn.classList.add('active');
      if (!isBusiness) container.insertBefore(petsBtn, container.firstChild);
    }
  }

});