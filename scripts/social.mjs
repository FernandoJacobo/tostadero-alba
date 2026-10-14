/**
 * Contenido para redes de la demo "Tostadero Alba".
 *
 *   npm run social -- [capture] [compose] [video] [--base=https://tostadero-alba.pages.dev]
 *
 * - capture: capturas del sitio en celular y escritorio, tema claro y oscuro → social/capturas/
 * - compose: posts, story y carrusel (1080×1350 / 1080×1920) → social/posts/, social/carrusel/
 * - video:   reels 9:16 (interacciones y recorrido) y recorrido 16:9, con portada → social/video/
 *
 * Sin argumentos ejecuta las tres etapas. Por defecto usa el sitio local (`npm run build && npm run preview`).
 */
import { mkdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import { launch, sleep, settle, useTheme, NO_DEFER_CSS } from './lib/browser.mjs';

const args = process.argv.slice(2);
const BASE = (args.find((a) => a.startsWith('--base='))?.slice(7) ?? 'http://localhost:4321').replace(/\/$/, '');
const steps = args.filter((a) => !a.startsWith('--'));
const run = (s) => steps.length === 0 || steps.includes(s);

const OUT = 'social';
const CAP = join(OUT, 'capturas');
const exec = promisify(execFile);

const MOBILE = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2 };

const FORM = { nombre: 'Daniela Ríos', personas: '4', ocasion: 'Cumpleaños', hora: '10:30', comentarios: 'Mesa en la terraza, por favor.' };

/** Próximo sábado (AAAA-MM-DD) para la reservación de ejemplo. */
function nextSaturday() {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

// ───────────────────────── Interacciones ─────────────────────────

/** Recorre la página para disparar apariciones y cifras animadas, y deja todo en su estado final. */
async function warm(page) {
  await page.addStyleTag({ content: NO_DEFER_CSS });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await sleep(50);
  }
  await sleep(1600); // cifras animadas (1.4 s)
  await settle(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
}

async function scrollToSel(page, sel, offset = 0) {
  await page.evaluate(
    (s, off) => {
      const el = document.querySelector(s);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + off);
    },
    sel,
    offset,
  );
  await sleep(500);
}

const selectTab = (id) => async (page) => {
  await page.evaluate((t) => document.getElementById(`tab-${t}`)?.click(), id);
  await sleep(700);
};

async function fillReservation(page) {
  await page.evaluate(
    (f, date) => {
      const form = document.querySelector('[data-reservation]');
      const set = (name, v) => {
        const el = form.elements.namedItem(name);
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set('nombre', f.nombre);
      set('personas', f.personas);
      set('ocasion', f.ocasion);
      set('fecha', date);
      set('hora', f.hora);
      set('comentarios', f.comentarios);
    },
    FORM,
    nextSaturday(),
  );
  await sleep(300);
}

async function openLightbox(page, index = 0) {
  await page.evaluate((i) => document.querySelector(`[data-gallery] [data-index="${i}"]`).click(), index);
  await sleep(1200);
}

// ───────────────────────── Capturas ─────────────────────────

async function shot(browser, { path = '/', viewport, file, theme = 'light', section, offset = 0, before, full = false }) {
  const page = await browser.newPage();
  await useTheme(page, theme);
  await page.setViewport(viewport);
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
  await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 90_000 });
  await warm(page);
  if (section) await scrollToSel(page, section, offset);
  if (before) await before(page);
  await page.screenshot({ path: join(CAP, file), type: 'png', fullPage: full });
  console.log('  ✓', file);
  await page.close();
}

async function capture() {
  await mkdir(CAP, { recursive: true });
  const browser = await launch();
  const m = (o) => shot(browser, { viewport: MOBILE, ...o });
  const d = (o) => shot(browser, { viewport: DESKTOP, ...o });

  console.log('Celular…');
  await m({ file: 'movil-inicio.png' });
  await m({ file: 'movil-inicio-oscuro.png', theme: 'dark' });
  await m({ file: 'movil-historia.png', section: '#historia', offset: 40 });
  await m({ file: 'movil-menu.png', section: '#menu', offset: 60 });
  await m({ file: 'movil-menu-desayunos.png', section: '[role=tablist]', offset: -110, before: selectTab('cocina') });
  await m({ file: 'movil-granos.png', section: '#granos li', offset: -96 });
  await m({ file: 'movil-talleres.png', section: '#talleres li', offset: -96 });
  await m({ file: 'movil-galeria.png', section: '[data-gallery]', offset: -100 });
  await m({ file: 'movil-lightbox.png', section: '[data-gallery]', offset: -100, before: (p) => openLightbox(p, 0) });
  await m({ file: 'movil-resenas.png', section: '#resenas', offset: 40 });
  await m({ file: 'movil-reservacion.png', section: '[data-reservation]', offset: -170, before: fillReservation });
  await m({ file: 'movil-reservacion-oscuro.png', theme: 'dark', section: '[data-reservation]', offset: -170, before: fillReservation });
  await m({ file: 'movil-visitanos.png', section: '#visitanos', offset: 40 });

  console.log('Escritorio…');
  await d({ file: 'escritorio-inicio.png' });
  await d({ file: 'escritorio-inicio-oscuro.png', theme: 'dark' });
  await d({ file: 'escritorio-historia.png', section: '#historia', offset: 60 });
  await d({ file: 'escritorio-menu.png', section: '#menu', offset: 60 });
  await d({ file: 'escritorio-menu-oscuro.png', theme: 'dark', section: '#menu', offset: 60, before: selectTab('panaderia') });
  await d({ file: 'escritorio-granos.png', section: '#granos', offset: 60 });
  await d({ file: 'escritorio-talleres.png', section: '#talleres', offset: 60 });
  await d({ file: 'escritorio-galeria.png', section: '#galeria', offset: 60 });
  await d({ file: 'escritorio-lightbox.png', section: '#galeria', offset: 60, before: (p) => openLightbox(p, 0) });
  await d({ file: 'escritorio-reservacion.png', section: '#reservar', offset: 60, before: fillReservation });
  await d({ file: 'escritorio-visitanos.png', section: '#visitanos', offset: 60 });
  await d({ file: 'escritorio-completa.png', full: true });
  await browser.close();
}

// ───────────────────────── Composición ─────────────────────────

const img = async (name) => `data:image/png;base64,${(await readFile(join(CAP, name))).toString('base64')}`;
const logo = async () => `data:image/svg+xml;base64,${(await readFile('public/favicon.svg')).toString('base64')}`;

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{width:var(--w);height:var(--h);overflow:hidden;background:#f6efe6;color:#2a211c;font-family:'DM Sans',sans-serif;position:relative}
body.deep{background:#2b1d16;color:#f6efe6}
body:after{content:"";position:absolute;inset:0;opacity:.05;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.blob{position:absolute;border-radius:46% 54% 60% 40% / 52% 40% 60% 48%;background:#efe4d6}
.blob.warm{background:#ecd3b8}
.blob.olive{background:#e3e3cc}
.deep .blob{background:#4a3328;opacity:.7}
.deep .blob.warm{background:#c27a3e;opacity:.22}
.kicker{font-weight:700;font-size:24px;letter-spacing:.18em;text-transform:uppercase;color:#5e6b3c;display:flex;align-items:center;gap:16px}
.kicker:before{content:"";width:48px;height:2px;background:currentColor}
.deep .kicker{color:#c9d39a}
h1,h2{font-family:Fraunces,serif;font-weight:600;letter-spacing:-.015em;line-height:1.02;color:#2b1d16}
h1 em,h2 em{font-weight:400;color:#96561f}
.deep h1,.deep h2{color:#f6efe6}
.deep h1 em,.deep h2 em{color:#e9b98a}
.lead{font-size:31px;line-height:1.45;color:#6f6056}
.deep .lead{color:#cdbcab}
.foot{position:absolute;left:72px;right:72px;bottom:52px;display:flex;justify-content:space-between;align-items:center;font-size:23px;color:#6f6056}
.deep .foot{color:#cdbcab}
.foot b{color:#2b1d16;font-weight:700}.deep .foot b{color:#f6efe6}
.brand{display:flex;align-items:center;gap:16px;font-family:Fraunces,serif;font-weight:600;font-size:42px;color:#2b1d16;letter-spacing:-.02em}
.brand em{font-weight:400}
.deep .brand{color:#f6efe6}
.brand img{width:64px;height:64px}
.chip{display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:999px;background:#efe4d6;color:#2b1d16;font-weight:600;font-size:24px}
.browser{border-radius:22px;overflow:hidden;background:#fffaf3;box-shadow:0 40px 80px -30px rgb(43 29 22/.4),0 0 0 1px rgb(43 29 22/.08)}
.browser .bar{height:44px;display:flex;align-items:center;gap:10px;padding:0 18px;background:#efe4d6}
.browser .bar i{width:12px;height:12px;border-radius:50%;background:#d8c4ad}
.browser .bar span{margin-left:16px;flex:1;height:26px;border-radius:8px;background:#fffaf3;font-size:15px;color:#6f6056;display:flex;align-items:center;padding:0 12px}
.browser img{display:block;width:100%}
.phone{border-radius:58px;padding:13px;background:#1a110c;box-shadow:0 50px 90px -30px rgb(43 29 22/.55);position:relative}
.phone .screen{border-radius:46px;overflow:hidden;padding-top:46px;background:#f6efe6}
.phone .screen.dark{background:#17100c}
.phone img{display:block;width:100%}
.phone:after{content:"";position:absolute;top:25px;left:50%;transform:translateX(-50%);width:100px;height:30px;border-radius:20px;background:#1a110c}
.label{margin-top:18px;text-align:center;font-weight:700;font-size:24px;color:#2b1d16}
.deep .label{color:#f6efe6}
ul.ticks{list-style:none;display:grid;gap:22px;font-size:30px;line-height:1.35}
ul.ticks li{display:flex;gap:16px}
ul.ticks li:before{content:"✓";flex:none;width:44px;height:44px;border-radius:14px;background:#c27a3e;color:#2b1d16;display:grid;place-items:center;font-weight:700;font-size:24px}
.score{display:flex;flex-direction:column;align-items:center;gap:16px}
.score .ring{width:190px;height:190px;border-radius:50%;display:grid;place-items:center;font-family:Fraunces,serif;font-weight:600;font-size:64px;color:#2b1d16;background:radial-gradient(closest-side,#fffaf3 80%,transparent 81%),conic-gradient(#5e6b3c calc(var(--v)*1%),#e4d6c5 0)}
.score span{font-size:24px;font-weight:600;color:#6f6056;text-align:center}
.seal{position:absolute;display:grid;place-items:center;width:200px;height:200px;border-radius:50%;background:#c27a3e;color:#2b1d16;font-family:Fraunces,serif;font-style:italic;font-size:34px;text-align:center;line-height:1.05;transform:rotate(-10deg);box-shadow:0 20px 40px -16px rgb(43 29 22/.5)}
`;

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;600;700&display=block';

function page(w, h, body, cls = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS_URL}"><style>:root{--w:${w}px;--h:${h}px}${CSS}</style></head><body class="${cls}">${body}</body></html>`;
}

const footer = '<div class="foot"><span>Demo · cafetería ficticia</span><span><b>JacoboDev</b> · jacobodev.pages.dev</span></div>';

async function render(browser, html, file, w, h) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle0' });
  // Carga explícita de cada estilo (document.fonts.ready no espera fuentes aún no solicitadas).
  await p.evaluate(async () => {
    const faces = ['400 40px Fraunces', '600 40px Fraunces', 'italic 400 40px Fraunces', '400 20px "DM Sans"', '600 20px "DM Sans"', '700 20px "DM Sans"'];
    await Promise.all(faces.map((f) => document.fonts.load(f, '0123456789AaÁéñ¿?')));
    await document.fonts.ready;
  });
  await p.screenshot({ path: file, type: 'jpeg', quality: 92 });
  await p.close();
  console.log('  ✓', file);
}

async function compose() {
  const POSTS = join(OUT, 'posts');
  const CARR = join(OUT, 'carrusel');
  await mkdir(POSTS, { recursive: true });
  await mkdir(CARR, { recursive: true });
  const browser = await launch();
  const L = await logo();
  const names = [
    'movil-inicio', 'movil-inicio-oscuro', 'movil-menu', 'movil-menu-desayunos', 'movil-granos', 'movil-talleres', 'movil-galeria',
    'movil-lightbox', 'movil-reservacion', 'movil-reservacion-oscuro', 'movil-visitanos',
    'escritorio-inicio', 'escritorio-menu', 'escritorio-menu-oscuro', 'escritorio-granos', 'escritorio-talleres', 'escritorio-galeria', 'escritorio-reservacion',
  ];
  const c = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await img(`${n}.png`)])));
  const isDark = (src) => /oscuro|lightbox/.test(Object.keys(c).find((k) => c[k] === src) ?? '');
  const browserFrame = (src, extra = '') =>
    `<div class="browser" style="${extra}"><div class="bar"><i></i><i></i><i></i><span>tostadero-alba.pages.dev</span></div><img src="${src}"></div>`;
  // Franja de estado arriba de la captura para que el notch no tape el encabezado del sitio.
  const phone = (src, w, extra = '') =>
    `<div class="phone" style="width:${w}px;${extra}"><div class="screen${isDark(src) ? ' dark' : ''}"><img src="${src}"></div></div>`;
  const brand = `<div class="brand"><img src="${L}">Tostadero <em>Alba</em></div>`;

  // Post 1080×1350: escritorio + celular
  await render(
    browser,
    page(1080, 1350, `
    <div class="blob" style="width:820px;height:760px;right:-300px;top:-220px"></div>
    <div class="blob warm" style="width:520px;height:480px;left:-220px;bottom:120px"></div>
    <div style="position:absolute;left:72px;top:72px;right:72px">
      <div class="kicker">Sitio web · Cafetería</div>
      <h2 style="font-size:80px;margin-top:26px">Una cafetería que<br>se ve <em>tan bien</em> como sabe.</h2>
    </div>
    ${browserFrame(c['escritorio-inicio'], 'position:absolute;left:72px;width:860px;top:500px')}
    ${phone(c['movil-inicio'], 250, 'position:absolute;right:56px;top:640px')}
    ${footer}`),
    join(POSTS, '01-post-escritorio-movil.jpg'), 1080, 1350,
  );

  // Post 1080×1350: claro / oscuro
  await render(
    browser,
    page(1080, 1350, `
    <div style="position:absolute;inset:0 50% 0 0;background:#f6efe6"></div>
    <div style="position:absolute;inset:0 0 0 50%;background:#17100c"></div>
    <h2 style="position:absolute;left:0;width:50%;top:80px;text-align:center;font-size:76px">Claro</h2>
    <h2 style="position:absolute;right:0;width:50%;top:80px;text-align:center;font-size:76px;color:#f6efe6"><em style="color:#e9b98a">Oscuro</em></h2>
    <div style="position:absolute;left:84px;top:220px;width:380px">${phone(c['movil-reservacion'], 380)}<p class="label">Tema claro</p></div>
    <div style="position:absolute;right:84px;top:220px;width:380px">${phone(c['movil-reservacion-oscuro'], 380)}<p class="label" style="color:#f6efe6">Tema oscuro</p></div>
    <div class="foot"><span>Se recuerda la preferencia</span><span style="color:#cdbcab"><b style="color:#f6efe6">JacoboDev</b> · jacobodev.pages.dev</span></div>`),
    join(POSTS, '02-post-claro-oscuro.jpg'), 1080, 1350,
  );

  // Story 1080×1920
  await render(
    browser,
    page(1080, 1920, `
    <div class="blob" style="width:900px;height:860px;right:-380px;top:620px"></div>
    <div class="blob warm" style="width:560px;height:520px;left:-260px;top:1180px"></div>
    <div style="position:absolute;left:80px;top:150px;right:80px">
      ${brand}
      <div class="kicker" style="margin-top:56px">Sitio web para cafeterías</div>
      <h2 style="font-size:104px;margin-top:24px">Del grano a tu taza,<br><em>sin prisa.</em></h2>
      <p class="lead" style="margin-top:28px;max-width:820px">Menú con pestañas, granos por WhatsApp y reservaciones en un toque.</p>
    </div>
    ${phone(c['movil-menu-desayunos'], 390, 'position:absolute;left:110px;top:860px;transform:rotate(-4deg)')}
    ${phone(c['movil-inicio'], 390, 'position:absolute;right:110px;top:800px;transform:rotate(4deg)')}
    <div class="foot" style="bottom:110px"><span>Demo · cafetería ficticia</span><span><b>JacoboDev</b> · jacobodev.pages.dev</span></div>`),
    join(POSTS, '03-story.jpg'), 1080, 1920,
  );

  // Carrusel 1080×1350
  const slides = [
    // 1. Portada
    [`<div class="blob" style="width:900px;height:860px;right:-360px;top:-120px"></div>
     <div class="blob warm" style="width:420px;height:400px;left:-160px;bottom:60px"></div>
     <div style="position:absolute;left:72px;top:96px;width:520px">
       ${brand}
       <div class="kicker" style="margin-top:80px">Caso de diseño web</div>
       <h1 style="font-size:92px;margin-top:28px">Sitio web<br>para una<br><em>cafetería de especialidad.</em></h1>
       <p class="lead" style="margin-top:32px">Desliza para ver cómo convierte antojo en visitas →</p>
     </div>
     ${phone(c['movil-inicio'], 360, 'position:absolute;right:70px;top:190px;transform:rotate(4deg)')}
     ${footer}`],
    // 2. Menú con pestañas
    [`<div class="blob olive" style="width:760px;height:700px;right:-280px;top:420px"></div>
     <div style="position:absolute;left:72px;top:96px;right:72px">
       <div class="kicker">La carta</div>
       <h2 style="font-size:70px;margin-top:24px">Un menú que <em>abre el apetito.</em></h2>
       <p class="lead" style="margin-top:22px;max-width:880px">Pestañas por categoría, precios en MXN y etiquetas vegano o sin gluten.</p>
     </div>
     ${browserFrame(c['escritorio-menu'], 'position:absolute;left:72px;width:720px;top:500px')}
     ${phone(c['movil-menu-desayunos'], 320, 'position:absolute;right:60px;top:540px')}
     ${footer}`],
    // 3. Granos
    [`<div class="blob warm" style="width:700px;height:660px;left:-260px;top:380px"></div>
     <div style="position:absolute;left:72px;top:96px;right:72px">
       <div class="kicker">Cafés de origen</div>
       <h2 style="font-size:70px;margin-top:24px">Vende granos <em>sin tienda en línea.</em></h2>
     </div>
     ${phone(c['movil-granos'], 350, 'position:absolute;left:96px;top:400px')}
     <ul class="ticks" style="position:absolute;left:510px;right:72px;top:470px">
       <li>Región, altura, proceso y notas de cata</li>
       <li>Indicador visual de tueste</li>
       <li>"Pedir" abre WhatsApp con el mensaje listo</li>
       <li>Sin carrito ni comisiones</li>
     </ul>
     ${footer}`],
    // 4. Talleres
    [`<div style="position:absolute;left:72px;top:96px;right:72px">
       <div class="kicker">Experiencias</div>
       <h2 style="font-size:70px;margin-top:24px">Talleres con <em>cupo en vivo.</em></h2>
       <p class="lead" style="margin-top:22px;max-width:860px">Cata, barismo y latte art. Cada uno se aparta por WhatsApp.</p>
     </div>
     ${browserFrame(c['escritorio-talleres'], 'position:absolute;left:72px;right:72px;top:500px')}
     ${footer}`, 'deep'],
    // 5. Galería + lightbox
    [`<div class="blob" style="width:760px;height:720px;right:-300px;top:260px"></div>
     <div style="position:absolute;left:72px;top:96px;right:72px">
       <div class="kicker">Galería</div>
       <h2 style="font-size:70px;margin-top:24px">Fotos que <em>dan antojo.</em></h2>
     </div>
     <div style="position:absolute;left:120px;top:330px;width:340px">${phone(c['movil-galeria'], 340)}<p class="label">Mosaico</p></div>
     <div style="position:absolute;right:120px;top:330px;width:340px">${phone(c['movil-lightbox'], 340)}<p class="label">Desliza para ver más</p></div>
     ${footer}`],
    // 6. Reservación
    [`<div class="blob warm" style="width:700px;height:640px;left:-300px;top:500px"></div>
     <div style="position:absolute;left:72px;top:96px;right:72px">
       <div class="kicker">Reservaciones</div>
       <h2 style="font-size:70px;margin-top:24px">La mesa se aparta <em>por WhatsApp.</em></h2>
     </div>
     ${phone(c['movil-reservacion'], 350, 'position:absolute;right:96px;top:400px')}
     <ul class="ticks" style="position:absolute;left:72px;right:520px;top:470px">
       <li>Solo ofrece horas en que está abierto</li>
       <li>Valida mientras escribes</li>
       <li>El mensaje sale con fecha, hora y ocasión</li>
       <li>Sin servidores ni cuotas mensuales</li>
     </ul>
     ${footer}`],
    // 7. Rendimiento
    [`<div class="blob" style="width:900px;height:800px;right:-380px;top:-200px"></div>
     <div style="position:absolute;left:72px;top:96px;right:72px">
       <div class="kicker">Lighthouse · celular</div>
       <h2 style="font-size:70px;margin-top:24px">Rápido, accesible y <em>listo para Google.</em></h2>
     </div>
     <div style="position:absolute;left:72px;right:72px;top:470px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
       ${[[96, 'Rendimiento'], [100, 'Accesibilidad'], [100, 'Buenas prácticas'], [100, 'SEO']].map(([v, n]) => `<div class="score"><div class="ring" style="--v:${v}">${v}</div><span>${n}</span></div>`).join('')}
     </div>
     <div style="position:absolute;left:72px;right:72px;top:820px;display:flex;flex-wrap:wrap;gap:14px">
       ${['Menú completo en datos estructurados', 'Abierto ahora en tiempo real', 'Modo claro y oscuro', 'Hosting gratuito en Cloudflare', 'Fácil de adaptar a tu marca'].map((t) => `<span class="chip">${t}</span>`).join('')}
     </div>
     ${footer}`],
    // 8. Cierre
    [`<div class="blob" style="width:900px;height:820px;left:-200px;top:180px"></div>
     <div class="blob warm" style="width:460px;height:420px;right:-160px;top:-100px"></div>
     <div style="position:absolute;left:72px;right:72px;top:250px;text-align:center">
       <div class="kicker" style="justify-content:center">Para cafeterías y restaurantes</div>
       <h2 style="font-size:96px;margin-top:36px">¿Tu sitio da<br>ganas de <em>visitarte?</em></h2>
       <p class="lead" style="margin:40px auto 0;max-width:800px">Diseño sitios rápidos y antojables, pensados para que te reserven.</p>
       <p style="display:inline-block;margin-top:56px;padding:24px 44px;border-radius:999px;background:#c27a3e;color:#2b1d16;font-weight:700;font-size:38px">jacobodev.pages.dev</p>
     </div>
     ${footer}`, 'deep'],
  ];
  for (const [i, [body, cls]] of slides.entries()) {
    await render(browser, page(1080, 1350, body, cls), join(CARR, `${String(i + 1).padStart(2, '0')}.jpg`), 1080, 1350);
  }
  await browser.close();
}

// ───────────────────────── Video ─────────────────────────

const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Efectos que se inyectan en la página durante la grabación: textos en pantalla, toques,
 * fundidos entre páginas, cambio de tema circular, portada y cierre.
 * Todas las animaciones son CSS; su velocidad se ajusta a la de captura (ver `Recorder.pace`).
 */
const FX_CSS = `
html{scroll-behavior:auto!important}
#fx{position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:var(--font-fraunces),sans-serif}
#fx .cap{position:absolute;left:50%;top:var(--cap-top,84px);transform:translateX(-50%);display:flex;align-items:center;gap:8px;white-space:nowrap;padding:10px 18px;border-radius:999px;background:#2b1d16;color:#f6efe6;font-weight:600;font-size:var(--cap-size,19px);letter-spacing:-.01em;box-shadow:0 12px 30px -10px rgb(43 29 22/.45);animation:fx-in .45s cubic-bezier(.2,.8,.2,1) both}
#fx .cap i{width:9px;height:9px;border-radius:50%;background:#c27a3e;flex:none}
#fx .cap.out{animation:fx-out .3s ease both}
@keyframes fx-in{from{opacity:0;transform:translate(-50%,-14px) scale(.96)}}
@keyframes fx-out{to{opacity:0;transform:translate(-50%,-10px)}}
#fx .tap{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:rgb(194 122 62/.35);border:3px solid #c27a3e;animation:fx-tap .7s ease-out both}
@keyframes fx-tap{0%{transform:scale(.3);opacity:0}25%{opacity:1}100%{transform:scale(1.25);opacity:0}}
#fx .shot{position:absolute;inset:0;width:100%;height:100%}
#fx .shot.fade{animation:fx-fade .45s ease both}
@keyframes fx-fade{to{opacity:0}}
@property --r{syntax:'<length>';inherits:false;initial-value:0px}
#fx .shot.reveal{--r:0px;-webkit-mask-image:radial-gradient(circle at var(--x) var(--y),transparent var(--r),#000 calc(var(--r) + 1px));mask-image:radial-gradient(circle at var(--x) var(--y),transparent var(--r),#000 calc(var(--r) + 1px));animation:fx-reveal .8s cubic-bezier(.6,0,.3,1) forwards}
@keyframes fx-reveal{to{--r:var(--rmax)}}
#fx .card{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 var(--card-pad,34px);background:#2b1d16;color:#f6efe6;overflow:hidden}
#fx .card.light{background:#f6efe6;color:#2b1d16}
#fx .card .b1,#fx .card .b2{position:absolute;border-radius:46% 54% 60% 40%/52% 40% 60% 48%}
#fx .card .b1{width:120%;aspect-ratio:1;right:-60%;top:-25%;background:#4a3328;opacity:.7}
#fx .card .b2{width:70%;aspect-ratio:1;left:-30%;bottom:-12%;background:#c27a3e;opacity:.25}
#fx .card > *:not(.b1):not(.b2){position:relative;animation:fx-up .6s cubic-bezier(.2,.8,.2,1) both}
#fx .card > :nth-child(4){animation-delay:.12s}#fx .card > :nth-child(5){animation-delay:.24s}#fx .card > :nth-child(6){animation-delay:.36s}#fx .card > :nth-child(7){animation-delay:.48s}
@keyframes fx-up{from{opacity:0;transform:translateY(24px)}}
#fx .card .logo{width:var(--logo,64px);height:var(--logo,64px)}
#fx .card .k{margin-top:28px;font-family:var(--font-dmsans),sans-serif;font-weight:600;font-size:var(--k,14px);letter-spacing:.14em;text-transform:uppercase;color:#c27a3e}
#fx .card h2{margin-top:12px;font-weight:600;font-size:var(--h,44px);line-height:1.02;letter-spacing:-.035em;color:#fff}
#fx .card h2 em{font-style:italic;font-weight:400;color:#e9b98a}
#fx .card p{margin-top:16px;font-family:var(--font-dmsans),sans-serif;font-size:var(--p,17px);line-height:1.45;color:#cdbcab}
#fx .card .url{display:inline-block;align-self:flex-start;margin-top:26px;padding:12px 22px;border-radius:999px;background:#c27a3e;color:#2b1d16;font-family:var(--font-dmsans),sans-serif;font-weight:700;font-size:var(--url,19px)}
#fx .card > .by{margin-top:22px;font-family:var(--font-dmsans),sans-serif;font-size:var(--by,13px);font-weight:600;color:#c27a3e}
#fx .card.out{animation:fx-cardout .5s ease both}
@keyframes fx-cardout{to{opacity:0;transform:scale(1.04)}}
`;

class Recorder {
  constructor({ page, dir, fps, vars = {} }) {
    Object.assign(this, { page, dir, fps, vars, n: 0, last: 0, cycle: null, rate: 1 });
    this.frameMs = 1000 / fps;
  }

  /** Inyecta efectos y reloj ajustable tras cada navegación. */
  async prepare() {
    await this.page.addStyleTag({ content: NO_DEFER_CSS + FX_CSS });
    await this.page.evaluate((vars) => {
      const fx = document.createElement('div');
      fx.id = 'fx';
      for (const [k, v] of Object.entries(vars)) fx.style.setProperty(k, v);
      document.body.append(fx);
      window.__fxCap = null;
    }, this.vars);
    this.cdp = await this.page.createCDPSession();
    await this.cdp.send('Animation.enable');
    if (this.cycle == null) {
      // Calibración: mide cuánto tarda cada captura para fijar la velocidad desde el primer cuadro.
      const t = performance.now();
      for (let i = 0; i < 4; i++) await this.page.screenshot({ type: 'jpeg', quality: 90, optimizeForSpeed: true });
      this.cycle = (performance.now() - t) / 4 + 8;
      this.rate = Math.min(1, this.frameMs / this.cycle);
    }
    this.last = 0;
    await this.applyRate();
  }

  /** Ajusta animaciones CSS y el reloj de JS para que corran a la velocidad del video, no a la de captura. */
  async applyRate() {
    await this.cdp.send('Animation.setPlaybackRate', { playbackRate: this.rate });
    await this.page.evaluate((r) => window.__setRate?.(r), this.rate);
  }

  async snap() {
    await this.page.screenshot({ path: join(this.dir, `${String(this.n++).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 90, optimizeForSpeed: true });
    const now = performance.now();
    if (this.last) {
      const dt = now - this.last;
      this.cycle = this.cycle == null ? dt : this.cycle * 0.85 + dt * 0.15;
      if (this.n % 10 === 0) {
        this.rate = Math.min(1, Math.max(0.05, this.frameMs / this.cycle));
        await this.applyRate();
      }
    }
    this.last = performance.now();
  }

  async hold(sec) {
    for (let i = 0, n = Math.round(sec * this.fps); i < n; i++) await this.snap();
  }

  async scrollBy(dy, sec) {
    const from = await this.page.evaluate(() => window.scrollY);
    const max = await this.page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const to = Math.max(0, Math.min(max, from + dy));
    const n = Math.max(1, Math.round(sec * this.fps));
    for (let i = 1; i <= n; i++) {
      await this.page.evaluate((y) => window.scrollTo(0, y), Math.round(from + (to - from) * ease(i / n)));
      await this.snap();
    }
  }

  async scrollToSel(sel, offset, sec) {
    const dy = await this.page.evaluate((s, off) => document.querySelector(s).getBoundingClientRect().top + off, sel, offset);
    await this.scrollBy(dy, sec);
  }

  async caption(text) {
    await this.page.evaluate((t) => {
      const fx = document.getElementById('fx');
      if (window.__fxCap) {
        const old = window.__fxCap;
        old.classList.add('out');
        setTimeout(() => old.remove(), 2000);
      }
      if (!t) return (window.__fxCap = null);
      const el = document.createElement('div');
      el.className = 'cap';
      el.innerHTML = `<i></i>${t}`;
      fx.append(el);
      window.__fxCap = el;
    }, text);
  }

  /** Toque visible sobre un elemento; luego ejecuta `act` (por defecto, click). */
  async tap(sel, { act = true, sec = 0.5 } = {}) {
    // Si el elemento queda fuera de la zona cómoda de la pantalla, primero se desplaza hasta él.
    const dy = await this.page.evaluate((s) => {
      const r = document.querySelector(s).getBoundingClientRect();
      const c = r.top + r.height / 2;
      return c < innerHeight * 0.25 || c > innerHeight * 0.72 ? c - innerHeight * 0.5 : 0;
    }, sel);
    if (dy) await this.scrollBy(dy, 0.5);
    const box = await this.page.evaluate((s) => {
      const el = typeof s === 'string' ? document.querySelector(s) : null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, sel);
    await this.page.evaluate(({ x, y }) => {
      const t = document.createElement('div');
      t.className = 'tap';
      t.style.left = `${x}px`;
      t.style.top = `${y}px`;
      document.getElementById('fx').append(t);
      setTimeout(() => t.remove(), 8000);
    }, box);
    await this.hold(0.12);
    if (act) await this.page.evaluate((s) => document.querySelector(s).click(), sel);
    await this.hold(sec);
  }

  /** Escribe texto en un campo, letra por letra. */
  async type(sel, text, cps = 22) {
    const perFrame = cps / this.fps;
    let shown = 0;
    while (shown < text.length) {
      shown = Math.min(text.length, shown + perFrame);
      await this.page.evaluate(
        (s, v) => {
          const el = document.querySelector(s);
          el.value = v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        },
        sel,
        text.slice(0, Math.floor(shown)),
      );
      await this.snap();
    }
  }

  async screenshotData() {
    return (await this.page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 92 }));
  }

  /** Navega con un fundido desde la página anterior. */
  async go(url, { fade = true } = {}) {
    const prev = fade && this.n > 0 ? await this.screenshotData() : null;
    await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 90_000 });
    await this.prepare();
    await this.page.evaluate(() => document.fonts.ready);
    if (prev) {
      await this.page.evaluate((d) => {
        const im = new Image();
        im.className = 'shot fade';
        im.src = `data:image/jpeg;base64,${d}`;
        document.getElementById('fx').append(im);
        setTimeout(() => im.remove(), 8000);
      }, prev);
    }
  }

  /** Cambia el tema con un círculo que se expande desde el botón. */
  async toggleTheme() {
    const sel = 'header [data-theme-toggle]';
    const box = await this.page.evaluate((s) => {
      const r = [...document.querySelectorAll(s)].find((e) => e.offsetParent).getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, sel);
    await this.page.evaluate(({ x, y }) => {
      const t = document.createElement('div');
      t.className = 'tap';
      t.style.left = `${x}px`;
      t.style.top = `${y}px`;
      document.getElementById('fx').append(t);
      setTimeout(() => t.remove(), 8000);
    }, box);
    await this.hold(0.2);
    const prev = await this.screenshotData();
    await this.page.evaluate(
      (d, { x, y }, s) => {
        const im = new Image();
        im.className = 'shot';
        im.src = `data:image/jpeg;base64,${d}`;
        document.getElementById('fx').prepend(im);
        return new Promise((res) => {
          im.onload = () => {
            [...document.querySelectorAll(s)].find((e) => e.offsetParent).click();
            im.style.setProperty('--x', `${x}px`);
            im.style.setProperty('--y', `${y}px`);
            im.style.setProperty('--rmax', `${Math.hypot(innerWidth, innerHeight) + 40}px`);
            im.classList.add('reveal');
            setTimeout(() => im.remove(), 15000);
            res();
          };
        });
      },
      prev,
      box,
      sel,
    );
    await this.hold(1);
  }

  async card(html, { light = false } = {}) {
    await this.page.evaluate(
      (h, l) => {
        const c = document.createElement('div');
        c.className = `card${l ? ' light' : ''}`;
        c.innerHTML = `<span class="b1"></span><span class="b2"></span>${h}`;
        document.getElementById('fx').append(c);
        window.__fxCard = c;
      },
      html,
      light,
    );
  }

  async cardOut() {
    await this.page.evaluate(() => {
      const c = window.__fxCard;
      c.classList.add('out');
      setTimeout(() => c.remove(), 4000);
    });
  }
}

/** Reloj de JS ajustable (cifras animadas con requestAnimationFrame) para que coincida con el video. */
function clockPatch() {
  const real = performance.now.bind(performance);
  let rate = 1;
  let base = real();
  let virt = base;
  window.__setRate = (r) => {
    virt = performance.now();
    base = real();
    rate = r;
  };
  performance.now = () => virt + (real() - base) * rate;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf(() => cb(performance.now()));
}

async function record({ name, viewport, scale, size, fps = 30, theme = 'light', vars, coverAt = 1.6, script }) {
  const dir = join(OUT, '_frames', name);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage();
  // Tema inicial solo si no hay preferencia guardada: el cambio de tema grabado se mantiene entre páginas.
  await page.evaluateOnNewDocument((t) => {
    if (!localStorage.getItem('theme')) localStorage.setItem('theme', t);
  }, theme);
  await page.evaluateOnNewDocument(clockPatch);
  await page.setViewport({ ...viewport, deviceScaleFactor: scale });
  const rec = new Recorder({ page, dir, fps, vars });
  await script(rec, page);
  await browser.close();

  const VIDEO = join(OUT, 'video');
  await mkdir(VIDEO, { recursive: true });
  const outFile = join(VIDEO, `${name}.mp4`);
  await exec(
    ffmpegPath,
    ['-y', '-framerate', String(fps), '-i', join(dir, '%05d.jpg'), '-vf', `scale=${size[0]}:${size[1]}:flags=lanczos,setsar=1`,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', '19', '-movflags', '+faststart', outFile],
    { maxBuffer: 1 << 26 },
  );
  // Portada: cuadro con la tarjeta de título ya completa, antes de que se desvanezca.
  await exec(ffmpegPath, ['-y', '-ss', String(coverAt), '-i', outFile, '-frames:v', '1', '-q:v', '3', outFile.replace(/\.mp4$/, '-portada.jpg')]);
  await rm(dir, { recursive: true, force: true });
  console.log('  ✓', outFile, `(${rec.n} cuadros, ${(rec.n / fps).toFixed(1)} s)`);
}

const LOGO_SVG = async () => (await readFile('public/favicon.svg', 'utf8')).replace('<svg ', '<svg class="logo" ');

const MOBILE_VIDEO = { viewport: { width: 390, height: 693, isMobile: true, hasTouch: true }, scale: 1080 / 390, size: [1080, 1920] };

async function introCard(rec, logoSvg, { kicker, title, text }) {
  await rec.card(`${logoSvg}<p class="k">${kicker}</p><h2>${title}</h2><p>${text}</p><p class="by">Demo por JacoboDev</p>`);
}

async function outroCard(rec, logoSvg) {
  await rec.card(
    `${logoSvg}<p class="k">Para cafeterías y restaurantes</p><h2>¿Quieres un sitio <em>así</em> para tu negocio?</h2><p>Menú, reservaciones y pedidos por WhatsApp. Rápido y fácil de actualizar.</p><span class="url">jacobodev.pages.dev</span>`,
  );
}

/** El lightbox es un <dialog> en la capa superior: los efectos se mueven dentro de él mientras está abierto. */
const fxInto = (rec, sel) => rec.page.evaluate((s) => document.querySelector(s).append(document.getElementById('fx')), sel);
const fxBack = (rec) => rec.page.evaluate(() => document.body.append(document.getElementById('fx')));

/** Toque visible sin desplazar la página (para botones dentro del lightbox). */
async function tapInPlace(rec, sel, { act = true, sec = 0.4 } = {}) {
  await rec.page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    const t = document.createElement('div');
    t.className = 'tap';
    t.style.left = `${r.left + r.width / 2}px`;
    t.style.top = `${r.top + r.height / 2}px`;
    document.getElementById('fx').append(t);
    setTimeout(() => t.remove(), 8000);
  }, sel);
  await rec.hold(0.12);
  if (act) await rec.page.evaluate((s) => document.querySelector(s).click(), sel);
  await rec.hold(sec);
}

async function lightboxTour(rec) {
  await rec.tap('[data-gallery] [data-index="0"]', { sec: 0.1 });
  await fxInto(rec, '[data-lightbox]');
  await rec.hold(1);
  await tapInPlace(rec, '[data-lb-next]', { sec: 0.9 });
  await tapInPlace(rec, '[data-lb-next]', { sec: 0.9 });
  await tapInPlace(rec, '[data-lb-close]', { act: false, sec: 0.1 });
  await fxBack(rec);
  await rec.page.evaluate(() => document.querySelector('[data-lightbox]').close());
  await rec.hold(0.4);
}

/** Llena la reservación como lo haría una persona: escribe el nombre y elige el resto con toques. */
async function bookTable(rec) {
  await rec.type('#rf-nombre', FORM.nombre);
  const choose = async (sel, value) => {
    await rec.tap(sel, { act: false, sec: 0.2 });
    await rec.page.evaluate(
      (s, v) => {
        const el = document.querySelector(s);
        el.value = v;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      sel,
      value,
    );
    await rec.hold(0.35);
  };
  await choose('#rf-personas', FORM.personas);
  await choose('#rf-ocasion', FORM.ocasion);
  await choose('#rf-fecha', nextSaturday());
  await choose('#rf-hora', FORM.hora);
  await rec.tap('.reservation-form button[type="submit"]', { act: false, sec: 1 });
}

async function video() {
  const logoSvg = await LOGO_SVG();

  console.log('Reel 9:16 · interacciones…');
  await record({
    name: 'tostadero-reel-interacciones-9x16',
    ...MOBILE_VIDEO,
    coverAt: 2,
    async script(rec) {
      await rec.go(`${BASE}/`, { fade: false });
      await introCard(rec, logoSvg, { kicker: 'Sitio web · Cafetería', title: 'Así se ve el sitio de una <em>cafetería de especialidad</em>', text: 'Todo lo que un cliente puede hacer desde su celular.' });
      await rec.hold(2.4);
      await rec.cardOut();
      await rec.hold(0.4);
      await rec.caption('Dice si está abierto ahora');
      await rec.hold(1.8);

      await rec.caption('Menú con pestañas');
      await rec.scrollToSel('[role="tablist"]', -150, 2.2);
      await rec.tap('#tab-sin-cafe', { sec: 0.9 });
      await rec.tap('#tab-cocina', { sec: 0.9 });
      await rec.scrollBy(420, 1.6);
      await rec.hold(0.4);

      await rec.caption('Granos con pedido por WhatsApp');
      await rec.scrollToSel('#granos li', -120, 1.8);
      await rec.hold(0.6);
      await rec.scrollBy(430, 1.4);
      await rec.tap('#granos li a.btn-wa', { act: false, sec: 0.8 });

      await rec.caption('Talleres con cupo en vivo');
      await rec.scrollToSel('#talleres li', -120, 1.8);
      await rec.hold(0.8);
      await rec.scrollBy(520, 1.4);
      await rec.hold(0.4);

      await rec.caption('Galería: toca y desliza');
      await rec.scrollToSel('[data-gallery]', -150, 1.8);
      await rec.hold(0.3);
      await lightboxTour(rec);

      await rec.caption('Modo oscuro en un toque');
      await rec.hold(0.3);
      await rec.toggleTheme();
      await rec.hold(0.4);

      await rec.caption('Reserva directo a WhatsApp');
      await rec.scrollToSel('[data-reservation]', -190, 2);
      await bookTable(rec);
      await rec.caption(null);

      await outroCard(rec, logoSvg);
      await rec.hold(3.2);
    },
  });

  console.log('Reel 9:16 · recorrido…');
  await record({
    name: 'tostadero-reel-recorrido-9x16',
    ...MOBILE_VIDEO,
    async script(rec) {
      await rec.go(`${BASE}/`, { fade: false });
      await introCard(rec, logoSvg, { kicker: 'Diseño web · Café', title: 'Del grano a tu taza, <em>sin prisa.</em>', text: 'Recorrido completo en celular.' });
      await rec.hold(2);
      await rec.cardOut();
      await rec.hold(1.2);
      // Hasta el cierre (ubicación), sin recorrer todo el pie de página
      const end = await rec.page.evaluate(() => document.querySelector('footer').getBoundingClientRect().top + scrollY - innerHeight + 80);
      await rec.scrollBy(end, 22);
      await rec.hold(0.6);
      await outroCard(rec, logoSvg);
      await rec.hold(3);
    },
  });

  console.log('Video 16:9 · escritorio…');
  await record({
    name: 'tostadero-recorrido-16x9',
    viewport: { width: 1440, height: 810 },
    scale: 1920 / 1440,
    size: [1920, 1080],
    vars: { '--cap-top': '100px', '--cap-size': '22px', '--card-pad': '160px', '--h': '76px', '--p': '24px', '--k': '18px', '--logo': '84px', '--url': '24px', '--by': '18px' },
    async script(rec) {
      await rec.go(`${BASE}/`, { fade: false });
      await introCard(rec, logoSvg, { kicker: 'Sitio web · Cafetería', title: 'Tostadero Alba:<br>sitio para una <em>cafetería de especialidad</em>', text: 'Astro · Tailwind · Lighthouse 96–100 en celular' });
      await rec.hold(2.2);
      await rec.cardOut();
      await rec.hold(1.4);
      await rec.scrollToSel('#historia', 0, 2.2);
      await rec.hold(0.6);
      await rec.caption('Menú con pestañas');
      await rec.scrollToSel('#menu', 0, 1.8);
      await rec.tap('#tab-cocina', { sec: 1 });
      await rec.tap('#tab-panaderia', { sec: 1 });
      await rec.caption('Granos y talleres por WhatsApp');
      await rec.scrollToSel('#granos', 0, 2);
      await rec.hold(0.8);
      await rec.scrollToSel('#talleres', 0, 2);
      await rec.hold(1);
      await rec.caption('Galería con lightbox');
      await rec.scrollToSel('#galeria', 0, 1.8);
      await lightboxTour(rec);
      await rec.caption('Reservaciones');
      await rec.scrollToSel('#reservar', 0, 2.2);
      await bookTable(rec);
      await rec.caption(null);
      await outroCard(rec, logoSvg);
      await rec.hold(3);
    },
  });
}

if (run('capture')) await capture();
if (run('compose')) {
  if (!existsSync(join(CAP, 'movil-inicio.png'))) throw new Error('Faltan capturas: ejecuta primero la etapa "capture".');
  await compose();
}
if (run('video')) await video();
