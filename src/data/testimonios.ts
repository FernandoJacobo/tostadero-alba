/** Reseñas ficticias para la demo (nombres abreviados). */
export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'El mejor flat white de la Americana. Te explican de dónde viene el grano sin presumir, y el croissant cruje como debe.',
    name: 'Daniela R.',
    detail: 'Viene cada semana',
    rating: 5,
  },
  {
    quote: 'Hice el taller de cata con mi pareja y ahora entendemos por qué nos gusta el café de Oaxaca. Muy bien explicado y nada pretencioso.',
    name: 'Luis y Ana',
    detail: 'Taller de cata',
    rating: 5,
  },
  {
    quote: 'Trabajo desde aquí dos días a la semana: buena luz, enchufes, wifi estable y nadie te apresura. Los chilaquiles verdes son otra cosa.',
    name: 'Marco T.',
    detail: 'Diseñador',
    rating: 5,
  },
  {
    quote: 'Pedí una bolsa del Neblina por WhatsApp y me la tenían lista, molida para mi Chemex. Huele increíble al abrirla.',
    name: 'Fernanda G.',
    detail: 'Compra granos',
    rating: 5,
  },
  {
    quote: 'Reservamos para un cumpleaños de diez personas y nos acomodaron en la terraza con todo listo. El rol de cardamomo desapareció en minutos.',
    name: 'Paola M.',
    detail: 'Celebración',
    rating: 5,
  },
  {
    quote: 'Opciones veganas que no son de relleno. El bowl de quinoa y el latte de avena con piloncillo son mi combinación.',
    name: 'Iván S.',
    detail: 'Vegano',
    rating: 4,
  },
];

export const ratingSummary = { value: 4.8, count: 527, source: 'reseñas en Google (ficticias)' };
