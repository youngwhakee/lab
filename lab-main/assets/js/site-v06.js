(() => {
  const nav = document.getElementById('site-navigation');
  const btn = document.querySelector('.mobile-menu');
  if (!nav || !btn) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  const setOpen = open => {
    nav.classList.toggle('is-open', open);
    backdrop.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? '×' : '☰';
  };

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  backdrop.addEventListener('click', () => setOpen(false));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
})();
