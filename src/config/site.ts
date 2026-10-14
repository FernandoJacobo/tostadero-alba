/**
 * Configuración central del negocio.
 * Para adaptar el sitio a otra cafetería o restaurante, edita este archivo y los datos de src/data/.
 * Ningún componente tiene datos de la marca escritos a mano.
 */

export type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

export interface OpeningSlot {
  /** Hora de apertura en formato 24 h, "HH:MM" */
  open: string;
  /** Hora de cierre en formato 24 h, "HH:MM" */
  close: string;
}

export const site = {
  name: 'Tostadero Alba',
  legalName: 'Tostadero Alba — Café de especialidad',
  shortName: 'Tostadero Alba',
  tagline: 'Café de especialidad',
  slogan: 'Del grano a tu taza, sin prisa.',
  description:
    'Cafetería de especialidad en la Colonia Americana, Guadalajara. Tostamos en casa granos de Chiapas, Veracruz y Oaxaca; desayunos, panadería de masa madre y talleres de café.',
  url: 'https://tostadero-alba.pages.dev',
  locale: 'es-MX',
  ogLocale: 'es_MX',
  currency: 'MXN',
  timeZone: 'America/Mexico_City',
  foundingYear: 2016,
  servesCuisine: ['Café de especialidad', 'Desayunos', 'Panadería'],

  contact: {
    phoneDisplay: '33 2345 6789',
    /** Formato E.164 para enlaces tel: */
    phone: '+523323456789',
    /** WhatsApp en formato internacional sin "+" ni espacios (para wa.me) */
    whatsapp: '5213323456789',
    email: 'hola@tostadero-alba-demo.mx',
  },

  address: {
    street: 'Calle General Coronado 1180',
    neighborhood: 'Col. Americana',
    city: 'Guadalajara',
    region: 'Jalisco',
    postalCode: '44160',
    country: 'MX',
    reference: 'A media cuadra de Av. Chapultepec, frente al jardín de la esquina.',
    parking: 'Estacionamiento público a 80 m (primera hora gratis con tu ticket) y biciestacionamiento en la entrada.',
    accessibility: 'Acceso a nivel de banqueta, baño accesible y menú en letra grande disponible en barra.',
    transit: 'A 6 minutos a pie de la estación Chapultepec de la Línea 3 del tren ligero.',
  },

  geo: { lat: 20.6745, lng: -103.3698 },

  /** Horario semanal. Un arreglo vacío = cerrado. Puede haber varios bloques por día. */
  hours: {
    lun: [{ open: '07:30', close: '21:00' }],
    mar: [{ open: '07:30', close: '21:00' }],
    mie: [{ open: '07:30', close: '21:00' }],
    jue: [{ open: '07:30', close: '21:00' }],
    vie: [{ open: '07:30', close: '22:00' }],
    sab: [{ open: '08:00', close: '22:00' }],
    dom: [{ open: '09:00', close: '16:00' }],
  } satisfies Record<DayKey, OpeningSlot[]>,

  /** Reservaciones: máximo de personas, minutos antes del cierre para el último horario e intervalo entre horarios. */
  booking: { maxPeople: 12, lastSlotBeforeClose: 60, slotMinutes: 30 },

  social: [
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
    { label: 'TikTok', href: 'https://tiktok.com/', icon: 'music' },
  ],

  stats: [
    { value: 9, label: 'orígenes mexicanos' },
    { value: new Date().getFullYear() - 2016, label: 'años tostando' },
    { value: 184000, suffix: '+', label: 'tazas servidas' },
  ],

  priceRange: '$$',
  payments: 'Efectivo, tarjetas y transferencia. Propina no incluida.',

  /** Navegación por anclas de la landing (el id de cada sección). */
  nav: [
    { label: 'Historia', href: '#historia' },
    { label: 'Menú', href: '#menu' },
    { label: 'Granos', href: '#granos' },
    { label: 'Talleres', href: '#talleres' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Visítanos', href: '#visitanos' },
  ],

  cta: { label: 'Reservar mesa', href: '#reservar' },

  credit: { label: 'Demo desarrollado por JacoboDev', href: 'https://jacobodev.pages.dev', display: 'jacobodev.pages.dev' },
  demoNotice: 'Sitio de demostración: la cafetería, los precios, los talleres y las reseñas son ficticios.',
} as const;

export const dayLabels: Record<DayKey, string> = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miércoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sábado',
  dom: 'Domingo',
};

export const dayOrder: DayKey[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

export const fullAddress = `${site.address.street}, ${site.address.neighborhood}, ${site.address.postalCode} ${site.address.city}, ${site.address.region}`;

export const mapEmbedUrl = `https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=16&output=embed`;
export const mapLinkUrl = `https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`;
export const wazeUrl = `https://waze.com/ul?ll=${site.geo.lat},${site.geo.lng}&navigate=yes`;

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${site.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const formatMXN = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);

/** "21:00" → "9:00 p. m." (formato de México; igual en el servidor y en el navegador). */
export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}\u00a0${h < 12 ? 'a.\u00a0m.' : 'p.\u00a0m.'}`;
};
