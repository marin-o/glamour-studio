export const POST_SERVICE_BUFFER_MINUTES = 15;

const catalog = [
  ['short-hair-haircut', 'Short-hair haircut', '400–500 MKD', 30],
  ['long-hair-haircut', 'Long-hair haircut', '700–900 MKD', 30],
  ['hairstyling', 'Hairstyling', '1300–1800 MKD', 30],
  ['hair-straightening-ironing', 'Hair straightening/ironing', '500 MKD', 30],
  ['hair-curling', 'Hair curling', '500–1500 MKD', 30],
  ['hair-coloring', 'Hair coloring', '1200–2000 MKD', 90],
  ['highlights', 'Highlights', 'from 3500 MKD', 240, 60],
  ['keratin-treatment', 'Keratin Treatment for hydration', '1500–2000 MKD', 90],
  ['makeup', 'Makeup', '1500 MKD', 60],
  ['balayage', 'Balayage', 'from 4500 MKD', 300, 60],
];

export const SERVICES = Object.freeze(
  catalog.map(([id, name, priceLabel, durationMinutes]) =>
    Object.freeze({ id, name, priceLabel, durationMinutes }),
  ),
);

const servicesById = new Map(SERVICES.map((service) => [service.id, service]));
const bookingDurationById = new Map(catalog.map(([id, _name, _priceLabel, durationMinutes, bookingDurationMinutes = durationMinutes]) => [id, bookingDurationMinutes]));
const workTrackByServiceId = new Map(SERVICES.map((service) => [service.id, service.id === 'makeup' ? 'makeup' : 'hair']));

export function getService(serviceId) {
  if (typeof serviceId !== 'string' || !servicesById.has(serviceId)) {
    throw new RangeError('serviceId must identify a confirmed service.');
  }

  return servicesById.get(serviceId);
}

export function getServiceBookingDurationMinutes(serviceId) {
  getService(serviceId);
  return bookingDurationById.get(serviceId);
}

export function getServiceWorkTrack(serviceId) {
  getService(serviceId);
  return workTrackByServiceId.get(serviceId);
}

export function getServiceOccupancyMinutes(serviceId) {
  return getServiceBookingDurationMinutes(serviceId) + POST_SERVICE_BUFFER_MINUTES;
}
