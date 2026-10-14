import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

/** Chrome instalado en el sistema (Windows/macOS/Linux) o el definido en CHROME_PATH. */
export function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('No se encontró Chrome. Define CHROME_PATH con la ruta del ejecutable.');
  return found;
}

export function launch(extra = {}) {
  return puppeteer.launch({ executablePath: chromePath(), headless: true, ...extra });
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Fija el tema (claro/oscuro) antes de que cargue la página, como si el usuario lo hubiera elegido. */
export async function useTheme(page, theme) {
  await page.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem('theme', t);
    } catch {}
  }, theme);
}

/**
 * Para capturar y grabar: scroll inmediato y secciones renderizadas desde el inicio
 * (el sitio usa content-visibility: auto, que con alturas estimadas descuadra el scroll programático).
 */
export const NO_DEFER_CSS =
  'html{scroll-behavior:auto!important} main>section,body>footer{content-visibility:visible!important}';

/**
 * Deja la página lista para capturar: muestra todo lo que aparece con scroll (data-reveal),
 * pone las cifras animadas en su valor final y espera las imágenes diferidas.
 */
export async function settle(page) {
  await page.addStyleTag({ content: NO_DEFER_CSS });
  await page.evaluate(async () => {
    document.querySelectorAll('[data-reveal]').forEach((e) => {
      e.classList.add('is-visible');
      e.classList.remove('reveal-pending');
    });
    document.querySelectorAll('[data-count]').forEach((e) => {
      const d = Number(e.dataset.decimals ?? 0);
      e.textContent = new Intl.NumberFormat('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }).format(
        Number(e.dataset.count),
      );
      e.dataset.observed = '';
    });
    const imgs = [...document.images].filter((i) => !i.complete);
    imgs.forEach((i) => (i.loading = 'eager'));
    await Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); })));
    await document.fonts.ready;
  });
  await sleep(400);
}
