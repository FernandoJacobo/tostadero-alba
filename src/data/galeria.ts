/** Fotos de la galería, en el orden en que aparecen. `ratio` define la forma en el mosaico. */
import type { ImageMetadata } from 'astro';
import lattesMesa from '@/assets/photos/lattes-mesa.jpg';
import interior from '@/assets/photos/interior.jpg';
import gotero from '@/assets/photos/gotero.jpg';
import rol from '@/assets/photos/rol.jpg';
import espressoCaida from '@/assets/photos/espresso-caida.jpg';
import panTostado from '@/assets/photos/pan-tostado.jpg';
import chemex from '@/assets/photos/chemex.jpg';
import interiorLuz from '@/assets/photos/interior-luz.jpg';
import goteroCobre from '@/assets/photos/gotero-cobre.jpg';
import palaGranos from '@/assets/photos/pala-granos.jpg';
import latteOscuro from '@/assets/photos/latte-oscuro.jpg';
import cataTazas from '@/assets/photos/cata-tazas.jpg';

export interface GalleryPhoto {
  image: ImageMetadata;
  alt: string;
  caption: string;
  ratio: string;
}

export const gallery: GalleryPhoto[] = [
  { image: lattesMesa, alt: 'Cuatro capuchinos con arte latte sobre una mesa redonda de madera', caption: 'Capuchinos para compartir', ratio: '4 / 5' },
  { image: interior, alt: 'Salón con sillones azules, mesas redondas y luz cálida de pared', caption: 'El salón', ratio: '3 / 4' },
  { image: chemex, alt: 'Café filtrándose en una cafetera de vidrio con collar de madera', caption: 'Filtrado en Chemex', ratio: '3 / 2' },
  { image: rol, alt: 'Caracol de masa danesa con semilla de amapola sobre un plato blanco', caption: 'Caracol de amapola', ratio: '1 / 1' },
  { image: espressoCaida, alt: 'Espresso cayendo en un vaso de vidrio sobre una báscula', caption: 'Espresso de la casa', ratio: '3 / 4' },
  { image: panTostado, alt: 'Pan de masa madre con aguacate y huevos pochados en un plato blanco', caption: 'Pan con aguacate', ratio: '4 / 5' },
  { image: palaGranos, alt: 'Pala metálica moviendo granos recién tostados en el enfriador', caption: 'Recién tostado', ratio: '3 / 2' },
  { image: interiorLuz, alt: 'Terraza luminosa con lámparas de ratán, plantas y mesas blancas', caption: 'La terraza', ratio: '3 / 4' },
  { image: gotero, alt: 'Vista superior de un gotero con filtro de papel y café molido', caption: 'Bloom en el filtro', ratio: '1 / 1' },
  { image: goteroCobre, alt: 'Agua cayendo sobre un gotero de cobre encima de una jarra de vidrio', caption: 'Método manual', ratio: '3 / 4' },
  { image: latteOscuro, alt: 'Capuchino con roseta en una mesa de madera oscura y desgastada', caption: 'Roseta', ratio: '1 / 1' },
  { image: cataTazas, alt: 'Tazas de cata y bolsas de granos alineadas para una sesión de cata', caption: 'Mesa de cata', ratio: '4 / 5' },
];
