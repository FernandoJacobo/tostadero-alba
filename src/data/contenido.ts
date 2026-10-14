/**
 * Textos de cada sección de la landing. Las palabras entre *asteriscos* se muestran en cursiva serif.
 */
import hero from '@/assets/photos/hero.jpg';
import tostador from '@/assets/photos/tostador.jpg';
import latteMano from '@/assets/photos/latte-mano.jpg';

export const heroContent = {
  eyebrow: 'Café de especialidad · Col. Americana',
  title: 'Del grano a tu taza, *sin prisa.*',
  lead: 'Tostamos en casa cafés de pequeños productores de Chiapas, Veracruz y Oaxaca. Ven por un filtrado, quédate por el pan recién horneado.',
  image: hero,
  imageAlt: 'Taza de café humeante sobre una mesa de madera con luz cálida de ventana',
  seal: 'Tostado en casa · Desde 2016 · ',
};

export const historia = {
  eyebrow: 'Nuestra historia',
  title: 'Empezó con un tostador de *cinco kilos* y muchas preguntas',
  paragraphs: [
    'Alba nació en 2016 en un local de doce metros sobre Coronado. Queríamos saber por qué el café de México, uno de los mejores del mundo, casi nunca se tomaba aquí en su mejor versión.',
    'Hoy compramos directo a nueve fincas, tostamos cada martes y viernes en lotes pequeños y servimos cada taza con la receta que mejor le queda a ese grano. Sin prisa, como debe ser.',
  ],
  quote: 'Si sabe a origen, lo hicimos bien.',
  quoteAuthor: 'Equipo de tueste',
  image: tostador,
  imageAlt: 'Tostador de café con granos girando en la bandeja de enfriamiento, en penumbra',
  secondImage: latteMano,
  secondImageAlt: 'Manos sosteniendo un capuchino con arte latte en forma de hoja',
};

export const marquee = ['Origen', 'Tueste', 'Taza', 'Masa madre', 'Sin prisa', 'Hecho en Guadalajara'];

export const menuIntro = {
  eyebrow: 'La carta',
  title: 'Para la mañana, *la tarde* y el antojo',
  lead: 'Precios en pesos mexicanos con IVA incluido.',
};

export const granosIntro = {
  eyebrow: 'Cafés de origen',
  title: 'Llévate el café *a casa*',
  lead: 'Bolsas de 250 g tostadas esta semana. En grano o molidas al momento para tu método. Pídelas por WhatsApp y pasa por ellas o pide envío local.',
};

export const talleresIntro = {
  eyebrow: 'Experiencias',
  title: 'Aprende a tomar *mejor café*',
  lead: 'Grupos pequeños en nuestra barra, con todo el material incluido. Aparta tu lugar por WhatsApp.',
};

export const galeriaIntro = {
  eyebrow: 'Galería',
  title: 'Un vistazo a la *barra*',
  lead: 'Toca una foto para verla en grande.',
};

export const testimoniosIntro = {
  eyebrow: 'Reseñas',
  title: 'Lo que dicen en *la mesa*',
};

export const reservaIntro = {
  eyebrow: 'Reservaciones',
  title: 'Aparta tu *mesa*',
  lead: 'Para grupos, celebraciones o simplemente asegurar tu lugar el fin de semana. Te confirmamos por WhatsApp en minutos dentro del horario de atención.',
  notes: [
    'Mantenemos tu mesa 15 minutos.',
    'Grupos de más de 12 personas: escríbenos para cotizar.',
    'Sin reservación también eres bienvenido.',
  ],
};

export const ubicacionIntro = {
  eyebrow: 'Visítanos',
  title: 'En el corazón de la *Americana*',
};
