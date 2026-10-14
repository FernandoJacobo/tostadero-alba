/** Experiencias y talleres. Fechas en formato ISO (hora local de la cafetería). */
import type { ImageMetadata } from 'astro';
import cata from '@/assets/photos/cata.jpg';
import espresso from '@/assets/photos/espresso.jpg';
import latte from '@/assets/photos/latte-vertido.jpg';

export interface Workshop {
  id: string;
  title: string;
  description: string;
  /** "AAAA-MM-DD" */
  date: string;
  /** "HH:MM" en 24 h */
  start: string;
  duration: string;
  capacity: number;
  /** Lugares ya apartados (para mostrar cupo restante) */
  booked: number;
  price: number;
  includes: string[];
  level: string;
  image: ImageMetadata;
  imageAlt: string;
}

export const workshops: Workshop[] = [
  {
    id: 'cata',
    title: 'Cata de café mexicano',
    description: 'Prueba tres orígenes lado a lado como lo hacen los tostadores y aprende a reconocer acidez, cuerpo y dulzor.',
    date: '2026-10-31',
    start: '11:00',
    duration: '2 h',
    capacity: 10,
    booked: 6,
    price: 450,
    includes: ['3 orígenes', 'Hoja de cata', 'Bolsa de 100 g'],
    level: 'Para todos',
    image: cata,
    imageAlt: 'Fila de tazas de cata con café molido sobre una barra de madera',
  },
  {
    id: 'barismo',
    title: 'Barismo básico',
    description: 'Calibra un espresso, entiende la molienda y prepara filtrados en V60 y prensa francesa para hacerlo igual en casa.',
    date: '2026-11-08',
    start: '10:00',
    duration: '3 h',
    capacity: 8,
    booked: 3,
    price: 890,
    includes: ['Práctica en máquina', 'Recetario', 'Café para llevar'],
    level: 'Principiante',
    image: espresso,
    imageAlt: 'Dos espressos extrayéndose de una máquina profesional',
  },
  {
    id: 'latte-art',
    title: 'Latte art: corazón y tulipán',
    description: 'Texturiza la leche y domina el vertido para dibujar tus primeras figuras. Mucha práctica y poca teoría.',
    date: '2026-11-22',
    start: '17:00',
    duration: '2.5 h',
    capacity: 6,
    booked: 5,
    price: 750,
    includes: ['Leche y café ilimitados', 'Jarra de práctica', 'Fotos de tus tazas'],
    level: 'Principiante',
    image: latte,
    imageAlt: 'Manos vertiendo leche texturizada en una taza para hacer arte latte',
  },
];

export const workshopMessage = (w: Workshop, dateLabel: string) =>
  `¡Hola! Quiero apartar un lugar en el taller "${w.title}" del ${dateLabel}.\n\nNombre: \nNúmero de personas: \n\n¿Cómo confirmo mi lugar?`;
