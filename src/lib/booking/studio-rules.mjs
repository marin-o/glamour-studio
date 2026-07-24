import { Temporal } from '@js-temporal/polyfill';

export const STUDIO_TIME_ZONE = 'Europe/Skopje';
export const SLOT_INTERVAL_MINUTES = 30;

function parseStudioDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError('date must be a calendar date in YYYY-MM-DD format.');
  }

  try {
    const date = Temporal.PlainDate.from(value);
    if (date.toString() !== value) {
      throw new RangeError('date must be a calendar date in YYYY-MM-DD format.');
    }
    return date;
  } catch {
    throw new RangeError('date must be a valid calendar date in YYYY-MM-DD format.');
  }
}

export function getWorkingWindow(dateValue) {
  const date = parseStudioDate(dateValue);
  const openingHour = date.month >= 4 && date.month <= 9 ? 6 : 10;
  const opening = Temporal.ZonedDateTime.from({
    timeZone: STUDIO_TIME_ZONE,
    year: date.year,
    month: date.month,
    day: date.day,
    hour: openingHour,
  });
  const closing = opening.with({ hour: 18, minute: 0, second: 0, millisecond: 0 });

  return Object.freeze({
    date: date.toString(),
    opening: opening.toInstant().toString(),
    closing: closing.toInstant().toString(),
  });
}

export { parseStudioDate };
