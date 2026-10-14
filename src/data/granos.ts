/** Cafés de origen a la venta (bolsa de 250 g, grano entero o molido al momento). */
import type { ImageMetadata } from 'astro';
import cerezas from '@/assets/photos/cerezas.jpg';
import granos from '@/assets/photos/granos.jpg';
import tostador from '@/assets/photos/tostador-granos.jpg';

export interface Coffee {
  id: string;
  name: string;
  region: string;
  state: string;
  /** Altura en metros sobre el nivel del mar */
  altitude: string;
  process: string;
  variety: string;
  notes: string[];
  /** Nivel de tueste de 1 (claro) a 5 (oscuro) */
  roast: 1 | 2 | 3 | 4 | 5;
  price: number;
  image: ImageMetadata;
  imageAlt: string;
  badge?: string;
}

export const roastLabels = ['', 'Claro', 'Medio claro', 'Medio', 'Medio oscuro', 'Oscuro'] as const;

export const coffees: Coffee[] = [
  {
    id: 'chiapas',
    name: 'Sierra Madre',
    region: 'Jaltenango',
    state: 'Chiapas',
    altitude: '1,450 m',
    process: 'Lavado',
    variety: 'Bourbon y Caturra',
    notes: ['Chocolate de leche', 'Nuez', 'Mandarina'],
    roast: 3,
    price: 265,
    image: granos,
    imageAlt: 'Granos de café tostado sobre una mesa de madera',
    badge: 'El de la casa',
  },
  {
    id: 'veracruz',
    name: 'Neblina',
    region: 'Coatepec',
    state: 'Veracruz',
    altitude: '1,300 m',
    process: 'Natural',
    variety: 'Typica y Garnica',
    notes: ['Frutos rojos', 'Cacao', 'Panela'],
    roast: 2,
    price: 285,
    image: cerezas,
    imageAlt: 'Cerezas de café rojas y verdes en una rama del cafeto',
  },
  {
    id: 'oaxaca',
    name: 'Azahar',
    region: 'Pluma Hidalgo',
    state: 'Oaxaca',
    altitude: '1,600 m',
    process: 'Honey',
    variety: 'Pluma Typica',
    notes: ['Durazno', 'Miel', 'Flor de azahar'],
    roast: 1,
    price: 320,
    image: tostador,
    imageAlt: 'Granos de café girando en la bandeja de enfriamiento del tostador',
    badge: 'Lote limitado',
  },
];

/** Mensaje prellenado de WhatsApp para pedir una bolsa. */
export const coffeeOrderMessage = (c: Coffee) =>
  `¡Hola! Quiero pedir una bolsa de 250 g del café ${c.name} (${c.region}, ${c.state}).\n\n¿Grano entero o molido? \n¿Para qué método lo preparo? \n\n¿Me confirman disponibilidad y cómo pagar?`;
