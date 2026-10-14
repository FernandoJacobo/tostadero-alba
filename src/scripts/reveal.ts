/**
 * Animaciones de entrada (data-reveal), entradas escalonadas (data-stagger en el contenedor)
 * y cifras animadas (data-count).
 * Solo opacity/transform; con prefers-reduced-motion se muestran directo.
 */
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el: HTMLElement) {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals ?? 0);
  const fmt = new Intl.NumberFormat('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (reduceMotion() || !Number.isFinite(target)) {
    el.textContent = fmt.format(target);
    return;
  }
  const duration = 1400;
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt.format(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initReveal() {
  // Stagger: cada hijo directo de [data-stagger] aparece con un pequeño retraso respecto al anterior
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((parent) => {
    const step = Number(parent.dataset.stagger || 90);
    [...parent.children].forEach((child, i) => {
      const el = child as HTMLElement;
      el.dataset.reveal = '';
      el.style.setProperty('--reveal-delay', `${(i % 6) * step}ms`);
    });
  });
  const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-observed])');
  const countEls = document.querySelectorAll<HTMLElement>('[data-count]:not([data-observed])');
  revealEls.forEach((el) => (el.dataset.observed = ''));
  countEls.forEach((el) => (el.dataset.observed = ''));

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    countEls.forEach(animateCount);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        if (el.dataset.count !== undefined) animateCount(el);
        else {
          el.classList.add('is-visible');
          el.classList.remove('reveal-pending');
        }
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );

  // Lo que ya está en pantalla se muestra sin animar (no retrasa el primer render)
  const vh = window.innerHeight;
  revealEls.forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.92) {
      el.classList.add('is-visible');
      return;
    }
    el.classList.add('reveal-pending');
    io.observe(el);
  });
  countEls.forEach((el) => {
    // Cifras ya visibles al cargar: valor final directo para no retrasar el render inicial
    if (el.getBoundingClientRect().top < vh) return;
    el.textContent = '0';
    io.observe(el);
  });
}
