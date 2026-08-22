import { Temporal } from '@js-temporal/polyfill';

import { getService, getServiceOccupancyMinutes, getServiceWorkTrack, POST_SERVICE_BUFFER_MINUTES } from './services.mjs';
import { getWorkingWindow, parseStudioDate, SLOT_INTERVAL_MINUTES, STUDIO_TIME_ZONE } from './studio-rules.mjs';

const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/i;

const REQUEST_KEYS = new Set(['serviceId', 'date', 'busyIntervals', 'constraints']);
const INTERVAL_KEYS = new Set(['start', 'end', 'track']);
const WORK_TRACKS = new Set(['makeup', 'hair']);

function isRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertExactRecord(value, label, allowedKeys, requiredKeys) {
  if (!isRecord(value)) {
    throw new TypeError(`${label} must be a plain object.`);
  }

  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) throw new RangeError(`Unknown ${label} field: ${key}.`);
  }
  for (const key of requiredKeys) {
    if (!Object.hasOwn(value, key)) throw new RangeError(`${label}.${key} is required.`);
  }
}

function parseInstant(value, label) {
  if (typeof value !== 'string' || !ISO_INSTANT.test(value)) {
    throw new RangeError(`${label} must be an ISO instant with a UTC offset.`);
  }

  try {
    return Temporal.Instant.from(value);
  } catch {
    throw new RangeError(`${label} must be a valid ISO instant.`);
  }
}

function compareInstants(left, right) {
  return Temporal.Instant.compare(left, right);
}

function alignedToInterval(start, opening, intervalMinutes) {
  return start.epochMilliseconds >= opening.epochMilliseconds
    && (start.epochMilliseconds - opening.epochMilliseconds) % (intervalMinutes * 60_000) === 0;
}

export function normalizeBusyIntervals(busyIntervals) {
  if (!Array.isArray(busyIntervals)) {
    throw new TypeError('busyIntervals must be an array.');
  }

  const intervals = busyIntervals
    .map((interval, index) => {
      assertExactRecord(interval, `busyIntervals[${index}]`, INTERVAL_KEYS, new Set(['start', 'end']));
      if (typeof interval.start !== 'string' || typeof interval.end !== 'string') {
        throw new TypeError(`busyIntervals[${index}].start and busyIntervals[${index}].end must be strings.`);
      }

      const start = parseInstant(interval.start, `busyIntervals[${index}].start`);
      const end = parseInstant(interval.end, `busyIntervals[${index}].end`);
      if (compareInstants(end, start) <= 0) {
        throw new RangeError(`busyIntervals[${index}].end must be after its start.`);
      }
      return { start, end, track: WORK_TRACKS.has(interval.track) ? interval.track : 'unknown' };
    })
    .sort((left, right) => compareInstants(left.start, right.start) || left.track.localeCompare(right.track));

  const normalized = [];
  for (const interval of intervals) {
    const previous = normalized.findLast((candidate) => candidate.track === interval.track);
    if (previous && compareInstants(interval.start, previous.end) <= 0) {
      if (compareInstants(interval.end, previous.end) > 0) {
        previous.end = interval.end;
      }
    } else {
      normalized.push({ ...interval });
    }
  }

  return normalized.map(({ start, end, track }) =>
    Object.freeze({ start: start.toString(), end: end.toString(), track }),
  );
}

function parseConstraints(constraints) {
  if (constraints === undefined) return null;
  const allowedKeys = new Set(['now', 'leadTimeMinutes', 'bookingHorizonDays']);
  assertExactRecord(constraints, 'constraints', allowedKeys, []);

  const hasLeadTime = constraints.leadTimeMinutes !== undefined;
  const hasHorizon = constraints.bookingHorizonDays !== undefined;
  if ((hasLeadTime || hasHorizon) && constraints.now === undefined) {
    throw new RangeError('constraints.now is required with lead time or booking horizon.');
  }

  for (const [key, value] of [
    ['leadTimeMinutes', constraints.leadTimeMinutes],
    ['bookingHorizonDays', constraints.bookingHorizonDays],
  ]) {
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
      throw new RangeError(`constraints.${key} must be a non-negative integer.`);
    }
  }

  return {
    now: constraints.now === undefined ? null : parseInstant(constraints.now, 'constraints.now'),
    leadTimeMinutes: constraints.leadTimeMinutes ?? 0,
    bookingHorizonDays: constraints.bookingHorizonDays,
  };
}

export function getAvailableStarts(request) {
  assertExactRecord(request, 'availability request', REQUEST_KEYS, ['serviceId', 'date']);
  const { serviceId, date, busyIntervals = [], constraints } = request;
  const service = getService(serviceId);
  const requestedDate = parseStudioDate(date);
  const window = getWorkingWindow(date);
  const opening = parseInstant(window.opening, 'working window opening');
  const closing = parseInstant(window.closing, 'working window closing');
  const requestedTrack = getServiceWorkTrack(service.id);
  const normalizedBusy = normalizeBusyIntervals(busyIntervals).filter(({ track }) => track === requestedTrack || track === 'unknown').map(({ start, end }) => ({
    start: parseInstant(start, 'normalized busy interval start'),
    end: parseInstant(end, 'normalized busy interval end'),
  }));
  const parsedConstraints = parseConstraints(constraints);

  if (parsedConstraints?.bookingHorizonDays !== undefined) {
    const horizonDate = parsedConstraints.now
      .toZonedDateTimeISO(STUDIO_TIME_ZONE)
      .toPlainDate()
      .add({ days: parsedConstraints.bookingHorizonDays });
    if (Temporal.PlainDate.compare(requestedDate, horizonDate) > 0) return [];
  }

  const earliestStart = parsedConstraints?.now
    ? parsedConstraints.now.add({ minutes: parsedConstraints.leadTimeMinutes })
    : null;
  const occupancyMinutes = getServiceOccupancyMinutes(service.id);
  const candidates = [];

  for (let start = opening; compareInstants(start.add({ minutes: occupancyMinutes }), closing) <= 0; start = start.add({ minutes: SLOT_INTERVAL_MINUTES })) {
    candidates.push(start);
  }
  for (const busy of normalizedBusy) {
    const start = busy.end;
    if (alignedToInterval(start, opening, POST_SERVICE_BUFFER_MINUTES)
      && !alignedToInterval(start, opening, SLOT_INTERVAL_MINUTES)
      && compareInstants(start.add({ minutes: occupancyMinutes }), closing) <= 0) {
      candidates.push(start);
    }
  }

  const starts = [];

  for (const start of candidates.sort(compareInstants)) {
    if (starts.at(-1) === start.toString()) continue;
    const end = start.add({ minutes: occupancyMinutes });
    const conflicts = normalizedBusy.some(
      (busy) => compareInstants(start, busy.end) < 0 && compareInstants(end, busy.start) > 0,
    );
    if (!conflicts && (!earliestStart || compareInstants(start, earliestStart) >= 0)) {
      starts.push(start.toString());
    }
  }

  return starts;
}
