export const PUBLIC_BOUNDS = Object.freeze({ name: 80, phone: 40, email: 160 });
export const initialBookingFlow = Object.freeze({ step: 'service', serviceId: '', date: '', start: '', name: '', phone: '', email: '', availability: 'idle', starts: [], submit: 'idle', key: '', keyFingerprint: '', notice: '', confirmation: null });
export function normalizedContact(flow) { return { name: flow.name.trim(), phone: flow.phone.trim(), email: flow.email.trim() }; }
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
export function submissionFingerprint(flow) { const contact = normalizedContact(flow); return JSON.stringify([flow.serviceId, flow.start, contact.name, contact.phone, contact.email]); }
export function nextKey(flow, createKey) { return flow.key && flow.keyFingerprint === submissionFingerprint(flow) ? flow.key : createKey(); }
export function canContinue(flow) { const contact = normalizedContact(flow); return flow.step === 'service' ? Boolean(flow.serviceId) : flow.step === 'appointment' ? Boolean(flow.date && flow.start) : Boolean(contact.name && contact.name.length <= PUBLIC_BOUNDS.name && contact.phone && contact.phone.length <= PUBLIC_BOUNDS.phone && contact.email && contact.email.length <= PUBLIC_BOUNDS.email && validEmail(contact.email)); }
export function moveBack(flow) { return { ...flow, step: flow.step === 'contact' ? 'appointment' : 'service', notice: '' }; }
export function staleSlot(flow) { return { ...flow, step: 'appointment', start: '', availability: 'idle', starts: [], submit: 'idle', notice: 'taken' }; }
export function confirmedView(booking) { return { serviceId: booking.serviceId, start: booking.start, notification: booking.notification }; }
export function createAvailabilityRequestGate() {
  let generation = 0; let controller = null;
  return { start(nextController) { controller?.abort(); controller = nextController; generation += 1; return generation; }, current(value) { return value === generation; }, clear() { controller?.abort(); controller = null; generation += 1; return generation; }, dispose() { return this.clear(); } };
}
export function createSubmissionGate() { let locked = false; return { acquire() { if (locked) return false; locked = true; return true; }, release() { locked = false; }, locked: () => locked }; }
export function skopjeLabel(instant, language, options = {}) { return new Intl.DateTimeFormat(language === 'mk' ? 'mk-MK' : 'en-GB', { timeZone: 'Europe/Skopje', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', ...options }).format(new Date(instant)); }
export function skopjeToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Skopje', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export const MANAGEMENT_SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/u;
export const MANAGEMENT_ADVERTISED_CUTOFF_HOURS = 12;
export const MANAGEMENT_OPERATIONAL_GRACE_MINUTES = 15;

export function readManagementSecret(hash) {
  return typeof hash === 'string' && hash.startsWith('#') && MANAGEMENT_SECRET_PATTERN.test(hash.slice(1)) ? hash.slice(1) : '';
}

export function managementDates(today = skopjeToday()) {
  const [year, month, day] = today.split('-').map(Number);
  if (![year, month, day].every(Number.isInteger)) return [];
  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date(Date.UTC(year, month - 1, day + index, 12)).toISOString().slice(0, 10);
    return { value, index, isToday: index === 0 };
  });
}

export function managementSlotGroups(starts, language) {
  const groups = { morning: [], afternoon: [] };
  for (const start of Array.isArray(starts) ? starts : []) {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Skopje', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(start)).find((part) => part.type === 'hour')?.value ?? 0);
    groups[hour < 12 ? 'morning' : 'afternoon'].push(start);
  }
  return groups;
}

export function managementCanCancel(booking, now = new Date()) {
  const effectiveCutoffMinutes = MANAGEMENT_ADVERTISED_CUTOFF_HOURS * 60 - MANAGEMENT_OPERATIONAL_GRACE_MINUTES;
  return Boolean(booking?.status === 'confirmed' && typeof booking.start === 'string' && Date.parse(booking.start) - now.valueOf() >= effectiveCutoffMinutes * 60 * 1000);
}

export function managementCanReschedule(booking) {
  return Boolean(booking?.status === 'confirmed' && booking.canReschedule === true);
}
