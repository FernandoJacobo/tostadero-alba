/**
 * Scroll a anclas compatible con `content-visibility: auto`.
 * Las secciones fuera de pantalla usan una altura estimada hasta que se renderizan, así que el scroll
 * nativo puede quedar corto o pasarse. Aquí se desplaza, y al terminar se corrige si la sección se movió.
 */
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function offsetOf(target: HTMLElement) {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  return target.getBoundingClientRect().top - padding;
}

function waitScrollEnd() {
  return new Promise<void>((resolve) => {
    let timer = 0;
    const done = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', done);
      resolve();
    };
    // `scrollend` donde existe; si no, se da por terminado tras 150 ms sin eventos de scroll
    const onScroll = () => {
      clearTimeout(timer);
      timer = window.setTimeout(done, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', done, { once: true });
    timer = window.setTimeout(done, 1200);
  });
}

export async function scrollToSection(target: HTMLElement, smooth = !reduceMotion()) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const delta = offsetOf(target);
    if (Math.abs(delta) < 2) break;
    window.scrollBy({ top: delta, behavior: smooth && attempt === 0 ? 'smooth' : 'auto' });
    await waitScrollEnd();
    // Un cuadro para que las secciones recién visibles se rendericen con su altura real
    await new Promise(requestAnimationFrame);
  }
  // Mantiene el comportamiento accesible del ancla: el foco pasa a la sección destino
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

export function initAnchors() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element).closest?.<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
    if (!link) return;
    const url = new URL(link.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    history.pushState(null, '', url.hash);
    void scrollToSection(target);
  });

  // Al entrar con #seccion en la URL (p. ej. desde la 404 o el aviso de privacidad)
  if (location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    // El navegador hace su propio salto al fragmento con alturas estimadas; se corrige justo después
    const fix = () =>
      setTimeout(async () => {
        if (target) await scrollToSection(target, false);
        document.documentElement.style.scrollBehavior = '';
      }, 120);
    if (document.readyState === 'complete') fix();
    else window.addEventListener('load', fix, { once: true });
  }
}
