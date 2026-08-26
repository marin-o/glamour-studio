import 'server-only';

import { createHash } from 'node:crypto';

const API = 'https://api.resend.com/emails';
const FROM = 'Glamour Studio <bookings@glamourstudio.mk>';
const REPLY_TO = 'glamourr.studio1@gmail.com';
const MAX_TIMEOUT_MS = 15_000;
const CALENDAR_ADDRESS = 'ул. Илија Алексов 6, Радовиш';
const CALENDAR_PROD_ID = '-//Glamour Studio//Booking//EN';
const SERVICES = Object.freeze({ makeup: ['Шминка', 'Makeup'], hairstyling: ['Фенирање', 'Hairstyling'], 'short-hair-haircut': ['Шишање за кратка коса', 'Short-hair haircut'], 'long-hair-haircut': ['Шишање за долга коса', 'Long-hair haircut'], 'hair-straightening-ironing': ['Исправување / пеглање', 'Hair straightening / ironing'], 'hair-curling': ['Виткање коса', 'Hair curling'], 'hair-coloring': ['Боење коса', 'Hair coloring'], highlights: ['Прамени', 'Highlights'], 'keratin-treatment': ['Кератински третман за хидратација', 'Keratin treatment for hydration'], balayage: ['Балајаж', 'Balayage'] });

function text(value, maximum = 300) { return typeof value === 'string' && value.trim() && value.length <= maximum && !/[\u0000-\u001f\u007f]/u.test(value); }
function escapeHtml(value) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]); }
function parseDate(value) { const date = new Date(value); if (!Number.isFinite(date.valueOf())) throw new TypeError('Booking email input is invalid.'); return date; }
function when(start, locale) { return new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Skopje', dateStyle: 'full', timeStyle: 'short' }).format(parseDate(start)); }
function utc(value) { return parseDate(value).toISOString().replace(/[-:]/gu, '').replace(/\.\d{3}Z$/u, 'Z'); }
function icsEscape(value) { return value.replace(/\\/gu, '\\\\').replace(/;/gu, '\\;').replace(/,/gu, '\\,').replace(/\r\n|\r|\n/gu, '\\n'); }
function foldIcsLine(line) {
  const output = []; let current = ''; let bytes = 0;
  for (const character of line) {
    const characterBytes = Buffer.byteLength(character, 'utf8');
    if (bytes + characterBytes > 75) { output.push(current); current = ` ${character}`; bytes = 1 + characterBytes; }
    else { current += character; bytes += characterBytes; }
  }
  output.push(current);
  return output.join('\r\n');
}
function calendarSummary(service) { return `Glamour Studio – ${service[0]} / ${service[1]}`; }
function calendarDescription() { return `Glamour Studio appointment.\n${CALENDAR_ADDRESS}`; }
function validEventId(value) { return text(value, 1024) && /^[a-zA-Z0-9_-]+$/u.test(value); }
function calendarUrl(service, start, end) {
  const query = new URLSearchParams({ action: 'TEMPLATE', text: calendarSummary(service), dates: `${utc(start)}/${utc(end)}`, ctz: 'Europe/Skopje', location: CALENDAR_ADDRESS, details: calendarDescription() });
  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}
function calendarAttachment({ eventId, service, start, end, sequence }) {
  const uid = `${createHash('sha256').update(eventId, 'utf8').digest('hex')}@glamourstudio.mk`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${CALENDAR_PROD_ID}`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTAMP:${utc(start)}`, `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`, `SEQUENCE:${sequence}`,
    `SUMMARY:${icsEscape(calendarSummary(service))}`, `LOCATION:${icsEscape(CALENDAR_ADDRESS)}`, `DESCRIPTION:${icsEscape(calendarDescription())}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return Object.freeze({ filename: 'glamour-studio-appointment.ics', content: Buffer.from(`${lines.map(foldIcsLine).join('\r\n')}\r\n`, 'utf8').toString('base64') });
}
function content(kind, service, date, mk) {
  const name = service[mk ? 0 : 1];
  const calendar = mk
    ? ['Додадете во Google Calendar', 'Користете го копчето подолу или приложената .ics-датотека за Google Calendar, Apple Calendar, Outlook или друг календар.']
    : ['Add to Google Calendar', 'Use the button below or the attached .ics file with Google Calendar, Apple Calendar, Outlook, or another calendar.'];
  if (kind === 'confirmed') return mk
    ? ['Вашиот термин е потврден', `Термин за: ${name}\nВреме: ${date}`, 'Можете да презакажете или откажете онлајн само повеќе од дванаесет часа пред почетокот. За промени во последните дванаесет часа, јавете се во салонот.', 'Управувајте со терминот', ...calendar, 'Копчето за управување не работи? Копирајте го линкот:', 'Копчето за календар не работи? Копирајте го линкот:']
    : ['Your appointment is confirmed', `Appointment: ${name}\nTime: ${date}`, 'You may reschedule or cancel online only more than twelve hours before the appointment. For changes within the final twelve hours, call the salon.', 'Manage appointment', ...calendar, 'Management button not working? Copy this link:', 'Calendar button not working? Copy this link:'];
  if (kind === 'rescheduled') return mk
    ? ['Вашиот термин е презакажан', `Термин за: ${name}\nНово време: ${date}`, 'За помош, одговорете на оваа порака или јавете се во салонот.', undefined, ...calendar, undefined, 'Копчето за календар не работи? Копирајте го линкот:']
    : ['Your appointment has been rescheduled', `Appointment: ${name}\nNew time: ${date}`, 'For help, reply to this email or call the salon.', undefined, ...calendar, undefined, 'Calendar button not working? Copy this link:'];
  return mk
    ? ['Вашиот термин е откажан', `Откажан термин за: ${name}`, 'Ако мислите дека ова е грешка, одговорете на оваа порака или јавете се во салонот.']
    : ['Your appointment has been cancelled', `Cancelled appointment: ${name}`, 'If you think this is a mistake, reply to this email or call the salon.'];
}
function htmlFallback(label, url) {
  return `<div style="margin:8px 0 0;padding:12px 14px;background:#F6E7DE;border:1px solid #D8BDB2;border-radius:8px;color:#6F5650;font-size:13px;line-height:1.5"><p style="margin:0 0 6px;font-weight:600">${escapeHtml(label)}</p><a href="${escapeHtml(url)}" style="display:block;color:#6F5650;text-decoration:underline;overflow-wrap:anywhere;word-break:break-all">${escapeHtml(url)}</a></div>`;
}
function htmlPart(part, { manageUrl, googleCalendarUrl } = {}) {
  const manage = manageUrl ? `<div style="margin:24px 0 28px"><p style="margin:0 0 8px"><a href="${escapeHtml(manageUrl)}" style="display:inline-block;background:#8A5F4A;color:#FFF8F5;padding:12px 18px;text-decoration:none;border-radius:4px">${escapeHtml(part[3])}</a></p>${htmlFallback(part[6], manageUrl)}</div>` : '';
  const calendar = googleCalendarUrl ? `<div style="margin:24px 0 28px"><p style="margin:0 0 8px"><a href="${escapeHtml(googleCalendarUrl)}" style="display:inline-block;background:#8A5F4A;color:#FFF8F5;padding:12px 18px;text-decoration:none;border-radius:4px">${escapeHtml(part[4])}</a></p><p style="margin:0 0 8px">${escapeHtml(part[5])}</p>${htmlFallback(part[7], googleCalendarUrl)}</div>` : '';
  return `<section style="font-family:Arial,sans-serif;color:#2f211b;line-height:1.55"><h1 style="font-size:22px">${escapeHtml(part[0])}</h1><p style="white-space:pre-line">${escapeHtml(part[1])}</p><p>${escapeHtml(part[2])}</p>${manage}${calendar}</section>`;
}
function stringify(part, { manageUrl, googleCalendarUrl } = {}) {
  const manage = manageUrl ? `\n\n${part[3]}: ${manageUrl}` : '';
  const calendar = googleCalendarUrl ? `\n\n${part[4]}: ${googleCalendarUrl}\n${part[5]}` : '';
  return `${part[0]}\n\n${part[1]}\n\n${part[2]}${manage}${calendar}`;
}

export function buildBookingEmail({ kind, serviceId, start, end, eventId, sequence, manageUrl } = {}) {
  const calendared = kind === 'confirmed' || kind === 'rescheduled';
  if (!['confirmed', 'rescheduled', 'cancelled'].includes(kind) || !SERVICES[serviceId] || !text(start) || calendared && (!text(end) || !validEventId(eventId) || !Number.isInteger(sequence) || sequence < 0 || sequence > 2_147_483_647 || parseDate(end).valueOf() <= parseDate(start).valueOf()) || kind === 'confirmed' && (!/^https:\/\/glamourstudio\.mk\/booking\/manage#[A-Za-z0-9_-]{43}$/.test(manageUrl ?? '') || sequence !== 0) || kind !== 'confirmed' && manageUrl !== undefined) throw new TypeError('Booking email input is invalid.');
  const service = SERVICES[serviceId]; const mk = content(kind, service, when(start, 'mk-MK'), true); const en = content(kind, service, when(start, 'en-GB'), false);
  const googleCalendarUrl = calendared ? calendarUrl(service, start, end) : undefined;
  const attachment = calendared ? calendarAttachment({ eventId, service, start, end, sequence }) : undefined;
  const subject = kind === 'confirmed' ? 'Glamour Studio | Потврден термин / Confirmed appointment' : kind === 'rescheduled' ? 'Glamour Studio | Презакажан термин / Rescheduled appointment' : 'Glamour Studio | Откажан термин / Cancelled appointment';
  return Object.freeze({ subject, text: `${stringify(mk, { manageUrl, googleCalendarUrl })}\n\n──────────\n\n${stringify(en, { manageUrl, googleCalendarUrl })}`, html: `${htmlPart(mk, { manageUrl, googleCalendarUrl })}<hr style="border:0;border-top:1px solid #d7c9bf;margin:28px 0">${htmlPart(en, { manageUrl, googleCalendarUrl })}`, ...(attachment ? { attachment } : {}) });
}

export function createResendNotifier({ env = process.env, fetch: injectedFetch = globalThis.fetch, timeoutMs = 8_000 } = {}) {
  const apiKey = env?.RESEND_API_KEY;
  if (!text(apiKey, 512) || typeof injectedFetch !== 'function' || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_TIMEOUT_MS) throw new TypeError('Resend configuration is invalid.');
  return Object.freeze({ async send({ to, idempotencyKey, ...input }) {
    if (!text(to, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(to) || !text(idempotencyKey, 256)) throw new TypeError('Resend notification input is invalid.');
    const template = buildBookingEmail(input); const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await injectedFetch(API, { method: 'POST', signal: controller.signal, headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json', 'idempotency-key': idempotencyKey }, body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject: template.subject, text: template.text, html: template.html, ...(template.attachment ? { attachments: [template.attachment] } : {}) }) });
      return Object.freeze({ delivered: response.ok });
    } catch { return Object.freeze({ delivered: false }); } finally { clearTimeout(timer); }
  } });
}

export const RESEND_FROM = FROM;
export const RESEND_REPLY_TO = REPLY_TO;
