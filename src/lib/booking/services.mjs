const catalog = [
  ['short-hair-haircut', 'Short-hair haircut', '400–500 MKD', 30],
  ['long-hair-haircut', 'Long-hair haircut', '700–900 MKD', 30],
  ['hairstyling', 'Hairstyling', '1300–1800 MKD', 30],
  ['hair-straightening-ironing', 'Hair straightening/ironing', '500 MKD', 30],
  ['hair-curling', 'Hair curling', '500–1500 MKD', 30],
  ['hair-coloring', 'Hair coloring', '1200–2000 MKD', 90],
  ['highlights', 'Highlights', 'from 3500 MKD', 240],
  ['keratin-treatment', 'Keratin treatment', '1500–2000 MKD', 90],
  ['makeup', 'Makeup', '1500 MKD', 60],
  ['balayage', 'Balayage', 'from 4500 MKD', 300],
];

export const SERVICES = Object.freeze(
  catalog.map(([id, name, priceLabel, durationMinutes]) =>
    Object.freeze({ id, name, priceLabel, durationMinutes }),
  ),
);

const servicesById = new Map(SERVICES.map((service) => [service.id, service]));

export function getService(serviceId) {
  if (typeof serviceId !== 'string' || !servicesById.has(serviceId)) {
    throw new RangeError('serviceId must identify a confirmed service.');
  }

  return servicesById.get(serviceId);
}
