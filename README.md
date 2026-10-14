# Tostadero Alba — Café de especialidad · demo

Landing page de una sola página para una **cafetería de especialidad ficticia** en la Colonia Americana, Guadalajara. Es una demo de portafolio para vender sitios web a cafeterías, restaurantes y negocios gastronómicos: cálida, muy fotográfica, responsive y rápida.

> Todo el contenido (cafetería, menú, precios, talleres, reseñas, teléfono y dirección) es **ficticio**. Las fotos son de Unsplash y no muestran rostros identificables ni marcas. Antes de elegir el nombre se buscó "Tostadero Alba": no aparece como cafetería; existen nombres parecidos en España (una empresa de frutos secos y una marca de café de Zaragoza), sin relación con esta demo.

## Stack

| Pieza | Uso |
| --- | --- |
| **Astro 7** (`output: 'static'`) | Generación estática, TypeScript estricto |
| **Tailwind CSS 4** (`@tailwindcss/vite`) | Estilos con design tokens en variables CSS (claro y oscuro) |
| **astro:assets** | Fotos locales a AVIF/WebP con `srcset`, `width`/`height` y `aspect-ratio` |
| **Fonts API de Astro** (Fontsource) | Fraunces (serif con cursivas) + DM Sans, autoalojadas, subset latino y pesos estáticos |
| **lucide-static** | Íconos SVG renderizados en build (0 KB de JS) |
| `@astrojs/sitemap` | `sitemap-index.xml` |

JavaScript en el cliente: solo scripts pequeños sin framework (tema, menú móvil, scroll-spy, pestañas del menú, lightbox, carrusel, formulario, "Abierto ahora", parallax y animaciones de entrada).

## Cómo correrlo (Windows / PowerShell)

```powershell
npm install
npm run dev       # http://localhost:4321
npm run check     # verificación de tipos (astro check)
npm run build     # genera dist/
npm run preview   # sirve dist/ localmente
```

Requiere Node 22.12 o superior. La primera build descarga las fuentes de Fontsource (necesita internet).

## Despliegue en Cloudflare Pages

1. Sube el repositorio a GitHub y en Cloudflare entra a **Workers & Pages → Create → Pages → Connect to Git**.
2. Framework preset: **Astro**.
3. **Build command:** `npm run build` · **Build output directory:** `dist`.
4. Variable de entorno: `NODE_VERSION = 22`.
5. Si el subdominio no es `tostadero-alba.pages.dev`, cambia `url` en `src/config/site.ts` y la línea `Sitemap:` de `public/robots.txt`.

`public/_headers` aplica caché de 1 año (inmutable) a `/_astro/*` y cabeceras de seguridad básicas. Las páginas se generan como `ruta.html` (`build.format: 'file'`), así que Cloudflare las sirve en URLs limpias (`/aviso-de-privacidad`).

> El `package-lock.json` se genera con npm 10 (`npx npm@10 install --package-lock-only`), la versión que usa Cloudflare Pages.

## Cómo adaptarlo a otra cafetería o restaurante

No hace falta tocar componentes. Edita:

| Qué | Dónde |
| --- | --- |
| Nombre, slogan, teléfono, WhatsApp, correo, dirección, coordenadas, horarios, redes, cifras, reservaciones, menú de navegación y crédito | `src/config/site.ts` |
| Textos de cada sección (hero, historia, encabezados, notas de reservación, palabras del marquee) | `src/data/contenido.ts` |
| Menú: categorías (pestañas), productos, precios y etiquetas | `src/data/menu.ts` |
| Cafés a la venta (región, altura, proceso, notas, tueste, precio) | `src/data/granos.ts` |
| Talleres (fecha, hora, cupo, precio, qué incluye) | `src/data/talleres.ts` |
| Fotos de la galería y su forma en el mosaico | `src/data/galeria.ts` |
| Reseñas y calificación | `src/data/testimonios.ts` |
| Colores claro y oscuro, radios y sombras | `:root` y `[data-theme='dark']` en `src/styles/global.css` |
| Tipografías | `fonts` en `astro.config.mjs` |
| Fotos | `src/assets/photos/` (reemplázalas conservando el nombre o cambia el `import` en `src/data/`) |
| Logo | `src/components/ui/LogoMark.astro`, `src/components/ui/Logo.astro` y `public/favicon.svg` |

En los títulos, las palabras entre `*asteriscos*` se muestran en cursiva serif (`"Aparta tu *mesa*"`).

Los horarios de `site.ts` alimentan a la vez el indicador "Abierto ahora", la tabla de horarios, el resumen del footer, los horarios disponibles del formulario de reservación y el JSON-LD. Un día con `[]` se muestra como cerrado y no se puede reservar.

## Secciones y funcionalidades

- **Navbar fija**: transparente sobre el hero y con fondo y blur al hacer scroll; *scroll-spy* (`aria-current="location"`); botón de tema; drawer móvil con `<dialog>`.
- **Hero**: foto a pantalla completa con parallax leve, título editorial, doble CTA, indicador **"Abierto ahora · Cierra a las 9:00 p. m."** calculado con la zona horaria del negocio y sello con texto circular y vapor animado.
- **Historia** con fotos editoriales, cita y tres cifras animadas.
- **Marquee** "Origen · Tueste · Taza…" (se pausa al pasar el cursor).
- **Menú con pestañas** (patrón ARIA tabs): clic, touch y teclado (←/→, Inicio/Fin). Carta con línea punteada en escritorio y lista compacta en móvil. Etiquetas vegano, sin gluten, favorito y de temporada. Sin JS se ven todas las categorías.
- **Cafés de origen**: región, altura, proceso, variedad, notas de cata, indicador de tueste y precio por bolsa de 250 g. "Pedir" abre WhatsApp con el mensaje prellenado.
- **Talleres**: fecha, hora, duración, nivel, qué incluye, cupo restante con barra de progreso y botón para apartar por WhatsApp.
- **Galería masonry** con lightbox propio: flechas del teclado, swipe en móvil, Escape, foco atrapado y regreso del foco a la foto. Sin JS, cada foto abre su versión grande.
- **Reseñas** en carrusel con `scroll-snap` y botones que se desactivan en los extremos.
- **Reservación**: nombre, personas, fecha, hora, ocasión y comentarios. Valida en vivo y solo ofrece horarios dentro del horario del día elegido (si es hoy, solo los que faltan). Abre WhatsApp con el mensaje formateado, o el correo como alternativa. No guarda datos.
- **Ubicación**: mapa de Google con `loading="lazy"`, botones a Google Maps y Waze, horario con el día de hoy resaltado, estacionamiento, accesibilidad y transporte.
- **Footer** con redes, navegación, horario resumido, aviso de privacidad, aviso de datos ficticios y la cintilla "Demo desarrollado por JacoboDev · jacobodev.pages.dev".
- En móvil, **barra inferior** con "Cómo llegar" y "Reservar", y botón flotante de WhatsApp en todas las pantallas.

## SEO local

- `title`, `description`, `canonical`, Open Graph y Twitter con imagen de 1200×630 generada en build. `lang="es-MX"`.
- JSON-LD `CafeOrCoffeeShop` con dirección, coordenadas, horarios, `acceptsReservations`, el **menú completo** (`Menu` → `MenuSection` → `MenuItem` con precio y dietas) y los cafés a la venta (`makesOffer`).
- `sitemap-index.xml` (sin la 404) y `robots.txt`. La 404 lleva `noindex`.

## Decisiones técnicas

- **Fotos locales** (descargadas de Unsplash) en lugar de URLs remotas con `?w=…&q=70`: `astro:assets` genera AVIF/WebP en varios tamaños, con dimensiones fijas (sin CLS) y sin depender de Unsplash en producción. Si una foto falla, queda un fondo cálido con el grano del logo.
- **JS vanilla en lugar de islas con framework**: las pestañas, el lightbox y el formulario son interacciones simples. Cada script pesa unos pocos KB y se carga como módulo.
- **Fuentes en pesos estáticos**: el archivo variable de Fraunces (con sus ejes SOFT/WONK/opsz) pesaba 118 KB más 147 KB de la cursiva. Con pesos estáticos cada archivo pesa de 14 a 23 KB y solo se precargan los dos que se ven en el hero. El LCP móvil bajó de 3.6 s a 2.5 s.
- **`content-visibility: auto`** en las secciones bajo el pliegue: en Lighthouse móvil el primer pintado bajó de ~2.6 s a ~0.4 s. Como esas secciones usan una altura estimada hasta renderizarse, `src/scripts/anchors.ts` corrige el scroll a las anclas (menú, CTA y entradas con `#seccion` en la URL) para que siempre terminen en el lugar exacto.
- **Textura de grano** con un SVG `feTurbulence` inline al 3–5 % sobre todo el sitio, sin peticiones extra.
- **Animaciones** solo con `transform`/`opacity`; todas se desactivan con `prefers-reduced-motion`.
- **Tema sin parpadeo**: un script inline en `<head>` aplica la preferencia guardada (o la del sistema) antes de pintar.
- **Caramelo de texto**: el caramelo de marca (`#C27A3E`) no alcanza contraste AA como texto sobre crema, así que precios y cursivas usan `--caramel-text` (`#96561F`). El caramelo original se reserva para botones con texto espresso.

## Resultados verificados (build local)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Inicio (Lighthouse móvil) | 96–97 | 100 | 100 | 100 |
| Aviso de privacidad | 100 | 100 | 100 | 100 |

Accesibilidad 100 también en modo oscuro. Sin scroll horizontal en 360, 390, 768, 1024, 1280 y 1536 px. Probado con navegador automatizado: pestañas con teclado y touch, lightbox (flechas, swipe, Escape y foco), formulario (errores en vivo, horarios por día y mensaje de WhatsApp), "Abierto ahora" con distintas horas simuladas, drawer móvil y anclas.

---

Demo desarrollado por **JacoboDev** · [jacobodev.pages.dev](https://jacobodev.pages.dev)
