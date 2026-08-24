import { createBookingManagementHandlers } from '../../../../lib/booking/http/handlers.mjs';
import { getBookingRuntime } from '../../../../lib/booking/runtime.mjs';
import { getProductionRequestContext } from '../../../../lib/booking/production/index.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const handlers = () => createBookingManagementHandlers(getBookingRuntime(), { getRequestContext: getProductionRequestContext });
export async function GET(request) { return handlers().read(request); }
export async function PATCH(request) { return handlers().reschedule(request); }
export async function DELETE(request) { return handlers().cancel(request); }
