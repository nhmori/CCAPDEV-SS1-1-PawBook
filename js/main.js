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

});