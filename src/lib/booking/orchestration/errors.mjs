import 'server-only';

export class BookingError extends Error {
  constructor(code, status = 503, options = {}) {
    super(code.replaceAll('_', ' ').toLowerCase());
    this.name = 'BookingError'; this.code = code; this.status = status;
    this.retryAfter = options.retryAfter;
  }
}

export function asBookingError(error) {
  if (error instanceof BookingError) return error;
  const code = error?.code;
  if (code === 'AUTHORIZATION_FAILED') return new BookingError('CALENDAR_UNAVAILABLE', 503);
  if (code === 'QUOTA_EXCEEDED' || code === 'RATE_LIMITED') return new BookingError('RATE_LIMITED', 429, { retryAfter: 60 });
  return new BookingError('CALENDAR_UNAVAILABLE', 503);
}
