/**
 * Menú de la cafetería. Cada categoría es una pestaña; cada producto, una línea de la carta.
 * Precios en MXN. Etiquetas disponibles: ver `tagLabels`.
 */
import type { ImageMetadata } from 'astro';
import latte from '@/assets/photos/latte-cerca.jpg';
import coldBrew from '@/assets/photos/cold-brew.jpg';
import chilaquiles from '@/assets/photos/chilaquiles.jpg';
import panes from '@/assets/photos/panes.jpg';

export type MenuTag = 'favorito' | 'vegano' | 'sin-gluten' | 'temporada';

export const tagLabels: Record<MenuTag, string> = {
  favorito: 'Favorito',
  vegano: 'Vegano',
  'sin-gluten': 'Sin gluten',
  temporada: 'De temporada',
};

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  /** Texto corto junto al precio, p. ej. "12 oz" */
  unit?: string;
  tags?: MenuTag[];
}

export interface MenuCategory {
  id: string;
  label: string;
  intro: string;
  image: ImageMetadata;
  imageAlt: string;
  note?: string;
  items: MenuItem[];
}

export const menu: MenuCategory[] = [
  {
    id: 'cafe',
    label: 'Café',
    intro: 'Espresso de la casa (Chiapas + Veracruz) o el grano de origen del día. Leche entera, deslactosada, de avena o almendra.',
    image: latte,
    imageAlt: 'Latte con arte en forma de hoja en una taza verde azulada',
    note: 'Leche vegetal sin costo extra.',
    items: [
      { name: 'Espresso', description: 'Doble, intenso y dulce. Notas de cacao y panela.', price: 45, tags: ['vegano'] },
      { name: 'Americano', description: 'Espresso alargado con agua caliente.', price: 52, unit: '12 oz', tags: ['vegano'] },
      { name: 'Cortado', description: 'Espresso con un toque de leche texturizada.', price: 58 },
      { name: 'Capuchino', description: 'Espuma sedosa y arte latte en cada taza.', price: 68, unit: '8 oz', tags: ['favorito'] },
      { name: 'Flat white', description: 'Doble ristretto con leche microtexturizada.', price: 72, unit: '8 oz' },
      { name: 'Latte de piloncillo', description: 'Con jarabe de piloncillo, canela y cáscara de naranja.', price: 78, unit: '12 oz', tags: ['favorito'] },
      { name: 'Filtrado V60', description: 'Método manual con el grano de origen que elijas.', price: 80, unit: '10 oz', tags: ['vegano'] },
      { name: 'Cold brew', description: 'Extracción en frío de 18 horas. Servido con hielo.', price: 72, unit: '14 oz', tags: ['vegano'] },
    ],
  },
  {
    id: 'sin-cafe',
    label: 'Sin café',
    intro: 'Bebidas calientes y frías para quien prefiere algo distinto, con la misma atención al detalle.',
    image: coldBrew,
    imageAlt: 'Vaso alto con bebida fría, hielo y leche en una barra de madera',
    items: [
      { name: 'Chocolate de metate', description: 'Cacao de Tabasco molido en piedra, con agua o leche.', price: 70, tags: ['favorito'] },
      { name: 'Matcha latte', description: 'Matcha ceremonial batido a mano con leche de avena.', price: 85, tags: ['vegano'] },
      { name: 'Chai especiado', description: 'Té negro, cardamomo, jengibre y pimienta, infusionado en casa.', price: 75 },
      { name: 'Golden milk', description: 'Cúrcuma, canela y miel de abeja de Jalisco.', price: 72, tags: ['sin-gluten'] },
      { name: 'Agua de jamaica y romero', description: 'Fresca, poco dulce, preparada cada mañana.', price: 48, unit: '16 oz', tags: ['vegano'] },
      { name: 'Té de hoja suelta', description: 'Pregunta por la selección del día: verde, negro o tisana.', price: 55, tags: ['vegano'] },
      { name: 'Limonada de pepino y chía', description: 'Natural o mineral.', price: 52, unit: '16 oz', tags: ['vegano'] },
    ],
  },
  {
    id: 'cocina',
    label: 'Desayunos y comida',
    intro: 'Cocina de mañana hasta las 4:00 p. m. Tortillas de maíz nixtamalizado y pan de masa madre de nuestro horno.',
    image: chilaquiles,
    imageAlt: 'Chilaquiles con huevo estrellado, crema y frijoles en un plato azul',
    note: 'Pregunta por opciones sin gluten y veganas del día.',
    items: [
      { name: 'Chilaquiles de la casa', description: 'Salsa verde tatemada o roja de guajillo, crema, queso fresco y huevo.', price: 165, tags: ['favorito'] },
      { name: 'Pan de masa madre con aguacate', description: 'Huevo pochado, semillas tostadas y chile de árbol.', price: 158 },
      { name: 'Molletes de frijol y chorizo de soya', description: 'Con pico de gallo y queso gratinado.', price: 132 },
      { name: 'Enfrijoladas', description: 'Frijol negro con hoja de aguacate, rellenas de huevo o pollo.', price: 148, tags: ['sin-gluten'] },
      { name: 'Bowl de yogur y granola', description: 'Granola de la casa, fruta de temporada y miel.', price: 118 },
      { name: 'Sándwich de pavo y brie', description: 'En focaccia, con arúgula y mermelada de higo.', price: 175 },
      { name: 'Quiche de espinaca y queso de cabra', description: 'Con ensalada verde y vinagreta de mostaza.', price: 145 },
      { name: 'Bowl de quinoa', description: 'Camote rostizado, garbanzo, kale y aderezo de tahini.', price: 168, tags: ['vegano', 'sin-gluten'] },
    ],
  },
  {
    id: 'panaderia',
    label: 'Panadería',
    intro: 'Horneamos cada mañana con fermentación lenta. Cuando se acaba, se acaba.',
    image: panes,
    imageAlt: 'Panes dulces laminados y caracoles recién horneados sobre una charola',
    items: [
      { name: 'Croissant de mantequilla', description: 'Laminado en tres días. Crujiente por fuera, alveolado por dentro.', price: 55, tags: ['favorito'] },
      { name: 'Concha de masa madre', description: 'Vainilla o cacao, con costra crujiente.', price: 42 },
      { name: 'Caracol de amapola', description: 'Masa danesa, semilla de amapola y glaseado de limón.', price: 62 },
      { name: 'Rol de canela y cardamomo', description: 'Estilo nórdico, poco dulce.', price: 65 },
      { name: 'Panqué de plátano', description: 'Con nuez y harina de almendra.', price: 58, tags: ['sin-gluten'] },
      { name: 'Galleta de chocolate amargo', description: 'Chocolate 70 % y sal de Colima.', price: 45 },
      { name: 'Muffin de mora azul', description: 'Sin huevo ni lácteos.', price: 52, tags: ['vegano'] },
      { name: 'Pan de muerto de masa madre', description: 'Con azahar y mantequilla. Solo en octubre y noviembre.', price: 68, tags: ['temporada'] },
    ],
  },
];
