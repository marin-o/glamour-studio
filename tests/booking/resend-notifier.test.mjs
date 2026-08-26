import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { buildBookingEmail, createResendNotifier, RESEND_FROM, RESEND_REPLY_TO } from '../../src/lib/booking/notifications/resend.mjs';

const secret = 'a'.repeat(43);
const eventId = 'event12345';
const manageUrl = `https://glamourstudio.mk/booking/manage#${secret}`;
const base = { serviceId: 'makeup', start: '2026-08-25T08:00:00Z', end: '2026-08-25T09:15:00Z', eventId };

function extractHtmlActionAnchors(html) {
  return [...html.matchAll(/<a href="([^"]+)"[^>]*>([^<]*)<\/a>/gu)].map(([, href, text]) => ({ href, text }));
}

function extractHtmlFallbackPanels(html) {
  return [...html.matchAll(/<p style="margin:0 0 6px;font-weight:600">([^<]*)<\/p><a href="([^"]+)"[^>]*>([^<]*)<\/a>/gu)].map(([, label, href, text]) => ({ label, href, text }));
}

test('Resend template is Macedonian-first, bilingual, and offers a safe calendar action only for active appointments', () => {
  const confirmation = buildBookingEmail({ kind: 'confirmed', ...base, sequence: 0, manageUrl });
  const rescheduled = buildBookingEmail({ kind: 'rescheduled', ...base, sequence: 3 });
  const cancelled = buildBookingEmail({ kind: 'cancelled', serviceId: 'makeup', start: base.start });
  for (const template of [confirmation, rescheduled]) {
    assert.match(template.text, /Google Calendar/); assert.match(template.text, /Apple Calendar/); assert.match(template.text, /Outlook/); assert.match(template.text, /calendar\.google\.com\/calendar\/render/);
    assert.match(template.html, /href="https:\/\/calendar\.google\.com\/calendar\/render/); assert.match(template.html, /Add to Google Calendar/); assert.match(template.html, /Додадете во Google Calendar/);
    assert.equal(template.attachment.filename, 'glamour-studio-appointment.ics');
  }
  assert.match(confirmation.text, new RegExp(manageUrl)); assert.doesNotMatch(rescheduled.text, /booking\/manage/); assert.equal(cancelled.attachment, undefined); assert.doesNotMatch(cancelled.text, /Google Calendar|\.ics|manage/i);
  assert.throws(() => buildBookingEmail({ kind: 'confirmed', serviceId: 'makeup', start: base.start, manageUrl }));
});

test('HTML action fallbacks are localized, quiet, safely wrapped, and preserve raw text URLs', () => {
  const confirmation = buildBookingEmail({ kind: 'confirmed', ...base, sequence: 0, manageUrl });
  const calendarUrl = confirmation.text.match(/https:\/\/calendar\.google\.com\/calendar\/render\S+/u)?.[0];
  assert.ok(calendarUrl);
  const escapedCalendarUrl = calendarUrl.replaceAll('&', '&amp;');
  assert.deepEqual(extractHtmlFallbackPanels(confirmation.html), [
    { label: 'Копчето за управување не работи? Копирајте го линкот:', href: manageUrl, text: manageUrl },
    { label: 'Копчето за календар не работи? Копирајте го линкот:', href: escapedCalendarUrl, text: escapedCalendarUrl },
    { label: 'Management button not working? Copy this link:', href: manageUrl, text: manageUrl },
    { label: 'Calendar button not working? Copy this link:', href: escapedCalendarUrl, text: escapedCalendarUrl },
  ]);
  assert.deepEqual(extractHtmlActionAnchors(confirmation.html), [
    { href: manageUrl, text: 'Управувајте со терминот' },
    { href: manageUrl, text: manageUrl },
    { href: escapedCalendarUrl, text: 'Додадете во Google Calendar' },
    { href: escapedCalendarUrl, text: escapedCalendarUrl },
    { href: manageUrl, text: 'Manage appointment' },
    { href: manageUrl, text: manageUrl },
    { href: escapedCalendarUrl, text: 'Add to Google Calendar' },
    { href: escapedCalendarUrl, text: escapedCalendarUrl },
  ]);
  assert.equal((confirmation.html.match(new RegExp(`href="${manageUrl.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}"`, 'gu')) ?? []).length, 4);
  assert.equal((confirmation.html.match(new RegExp(`>${manageUrl.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}<\\/a>`, 'gu')) ?? []).length, 2);
  assert.equal((confirmation.html.match(new RegExp(`href="${escapedCalendarUrl.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}"`, 'gu')) ?? []).length, 4);
  assert.equal((confirmation.html.match(new RegExp(`>${escapedCalendarUrl.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}<\\/a>`, 'gu')) ?? []).length, 2);
  assert.match(confirmation.html, /background:#F6E7DE;[^"]*color:#6F5650/u);
  assert.match(confirmation.html, /overflow-wrap:anywhere;word-break:break-all/u);
  assert.equal(confirmation.html.includes(`href="${escapedCalendarUrl}"`), true);
  assert.equal(confirmation.html.includes(`>${escapedCalendarUrl}</a>`), true);
  assert.equal(confirmation.html.includes(calendarUrl), false);
  assert.equal(confirmation.text.includes(`Manage appointment: ${manageUrl}`), true);
  assert.equal(confirmation.text.includes(`Add to Google Calendar: ${calendarUrl}`), true);

  const rescheduled = buildBookingEmail({ kind: 'rescheduled', ...base, sequence: 3 });
  assert.doesNotMatch(rescheduled.html, /Management button not working|Копчето за управување/u);
  assert.match(rescheduled.html, /Calendar button not working\? Copy this link:/u);
  const cancelled = buildBookingEmail({ kind: 'cancelled', serviceId: 'makeup', start: base.start });
  assert.doesNotMatch(cancelled.html, /button not working|Копчето за/u);
});

test('calendar attachment is CRLF iCalendar, deterministic, opaque, and free from secret or contact data', () => {
  const template = buildBookingEmail({ kind: 'confirmed', ...base, sequence: 0, manageUrl });
  const ics = Buffer.from(template.attachment.content, 'base64').toString('utf8');
  const unfolded = ics.replace(/\r\n /gu, '');
  const uid = createHash('sha256').update(eventId, 'utf8').digest('hex');
  assert.match(ics, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\n/m); assert.match(ics, /PRODID:-\/\/Glamour Studio\/\/Booking\/\/EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH/); assert.match(unfolded, new RegExp(`UID:${uid}@glamourstudio\.mk`));
  assert.match(unfolded, /DTSTAMP:20260825T080000Z\r\nDTSTART:20260825T080000Z\r\nDTEND:20260825T091500Z\r\nSEQUENCE:0/); assert.match(unfolded, /LOCATION:ул\. Илија Алексов 6\\, Радовиш/); assert.match(ics, /END:VEVENT\r\nEND:VCALENDAR\r\n$/); assert.doesNotMatch(ics, /(?<!\r)\n/u);
  const googleCalendarUrl = template.text.match(/https:\/\/calendar\.google\.com\/calendar\/render\S+/u)?.[0] ?? '';
  for (const secretValue of [secret, 'ana@example.com', 'Ana Customer', '070123456', eventId, 'confirmation-key']) assert.doesNotMatch(`${googleCalendarUrl}\n${ics}`, new RegExp(secretValue));
  const rescheduled = buildBookingEmail({ kind: 'rescheduled', ...base, sequence: 4 }); const movedIcs = Buffer.from(rescheduled.attachment.content, 'base64').toString('utf8').replace(/\r\n /gu, ''); assert.match(movedIcs, new RegExp(`UID:${uid}@glamourstudio\.mk`)); assert.match(movedIcs, /SEQUENCE:4/);
});

test('Resend sends bounded direct-fetch payloads with deterministic base64 attachments and no cancellation attachment', async () => {
  const calls = []; const notifier = createResendNotifier({ env: { RESEND_API_KEY: 'x'.repeat(20) }, fetch: async (url, init) => { calls.push({ url, init }); return new Response('{}', { status: 200 }); } });
  assert.deepEqual(await notifier.send({ to: 'ana@example.com', idempotencyKey: 'confirmation-key', kind: 'confirmed', ...base, sequence: 0, manageUrl }), { delivered: true });
  assert.deepEqual(await notifier.send({ to: 'ana@example.com', idempotencyKey: 'cancellation-key', kind: 'cancelled', serviceId: 'makeup', start: base.start }), { delivered: true });
  assert.equal(calls[0].url, 'https://api.resend.com/emails'); assert.equal(calls[0].init.headers['idempotency-key'], 'confirmation-key'); const confirmed = JSON.parse(calls[0].init.body); assert.equal(confirmed.from, RESEND_FROM); assert.equal(confirmed.reply_to, RESEND_REPLY_TO); assert.deepEqual(Object.keys(confirmed.attachments[0]).sort(), ['content', 'filename']); assert.equal(confirmed.attachments[0].filename, 'glamour-studio-appointment.ics'); assert.equal(Buffer.from(confirmed.attachments[0].content, 'base64').toString('utf8').startsWith('BEGIN:VCALENDAR\r\n'), true);
  assert.equal(JSON.parse(calls[1].init.body).attachments, undefined);
  const failing = createResendNotifier({ env: { RESEND_API_KEY: 'x'.repeat(20) }, fetch: async () => { throw new Error('do not leak customer'); } }); assert.deepEqual(await failing.send({ to: 'ana@example.com', idempotencyKey: 'confirmation-key', kind: 'cancelled', serviceId: 'makeup', start: base.start }), { delivered: false });
});
