import { createBookingHandler } from '../../../lib/booking/http/handlers.mjs';
import { getBookingRuntime } from '../../../lib/booking/runtime.mjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function POST(request) { return createBookingHandler(getBookingRuntime())(request); }
