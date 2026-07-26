import { createAvailabilityHandler } from '../../../../lib/booking/http/handlers.mjs';
import { getBookingRuntime } from '../../../../lib/booking/runtime.mjs';
import { getProductionRequestContext } from '../../../../lib/booking/production/index.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(request) { return createAvailabilityHandler(getBookingRuntime(), { getRequestContext: getProductionRequestContext })(request); }
