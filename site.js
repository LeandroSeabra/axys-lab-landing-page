// Ano no rodapé e entradas das seções das páginas de área.
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
(() => {
  const selectors = ['.section-title', '.service', '.showcase figure', '.showcase-copy > *', '.steps li', '.uses-row li', '.siblings li', '.contact > *'];
  const targets = [];
  selectors.forEach((sel) => document.querySelectorAll(sel).forEach((el, i) => {
    el.setAttribute('data-reveal', '');
    el.style.setProperty('--d', String(Math.min([...el.parentElement.children].indexOf(el), 6)));
    targets.push(el);
  }));
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  targets.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
  }), 2500));
})();
