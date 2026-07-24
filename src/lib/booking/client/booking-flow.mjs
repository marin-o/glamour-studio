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
