import { site, dayOrder, type DayKey } from '@/config/site';
import { menu, type MenuItem } from '@/data/menu';
import { coffees } from '@/data/granos';

const schemaDay: Record<DayKey, string> = {
  lun: 'Monday',
  mar: 'Tuesday',
  mie: 'Wednesday',
  jue: 'Thursday',
  vie: 'Friday',
  sab: 'Saturday',
  dom: 'Sunday',
};

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();

/** `/ruta.html` (build.format: 'file') → `/ruta` para canonical y comparaciones. */
export const cleanPath = (pathname: string) => {
  const p = pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/$/, '');
  return p === '' ? '/' : p;
};

export const businessId = `${site.url}/#cafeteria`;

const offer = (price: number) => ({ '@type': 'Offer', price: price.toFixed(2), priceCurrency: site.currency });

const diets = (item: MenuItem) => {
  const list = [
    item.tags?.includes('vegano') && 'https://schema.org/VeganDiet',
    item.tags?.includes('sin-gluten') && 'https://schema.org/GlutenFreeDiet',
  ].filter(Boolean);
  return list.length ? { suitableForDiet: list } : {};
};

/** JSON-LD CafeOrCoffeeShop con horarios, dirección y menú completo (Menu → MenuSection → MenuItem). */
export function businessSchema(image: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': businessId,
    name: site.legalName,
    alternateName: site.name,
    slogan: site.slogan,
    description: site.description,
    url: site.url,
    logo: absoluteUrl('/favicon.svg'),
    image,
    telephone: site.contact.phone,
    email: site.contact.email,
    priceRange: site.priceRange,
    currenciesAccepted: site.currency,
    paymentAccepted: 'Efectivo, Tarjeta de crédito, Tarjeta de débito, Transferencia',
    servesCuisine: site.servesCuisine,
    acceptsReservations: true,
    foundingDate: String(site.foundingYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: `https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}`,
    openingHoursSpecification: dayOrder.flatMap((day) =>
      site.hours[day].map((slot) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${schemaDay[day]}`,
        opens: slot.open,
        closes: slot.close,
      })),
    ),
    hasMenu: {
      '@type': 'Menu',
      name: `Menú de ${site.name}`,
      inLanguage: site.locale,
      hasMenuSection: menu.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.label,
        description: cat.intro,
        hasMenuItem: cat.items.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          offers: offer(item.price),
          ...diets(item),
        })),
      })),
    },
    makesOffer: coffees.map((c) => ({
      ...offer(c.price),
      itemOffered: {
        '@type': 'Product',
        name: `Café ${c.name} · ${c.region}, ${c.state} (250 g)`,
        description: `Proceso ${c.process.toLowerCase()}, ${c.altitude}. Notas: ${c.notes.join(', ')}.`,
      },
    })),
    sameAs: site.social.map((s) => s.href),
  };
}
