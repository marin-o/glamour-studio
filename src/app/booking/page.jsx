import BookingExperience from '../../components/booking/BookingExperience';
import { SERVICES } from '../../lib/booking/services.mjs';
import { skopjeToday } from '../../lib/booking/client/booking-flow.mjs';

export default async function BookingPage({ searchParams }) {
  const params = await searchParams;
  const service = typeof params?.service === 'string' && SERVICES.some((item) => item.id === params.service) ? params.service : '';
  return <><BookingExperience initialServiceId={service} initialSkopjeDate={skopjeToday()} /><noscript><main lang="mk"><h1>Онлајн закажување</h1><p>За онлајн избор е потребен JavaScript. Јавете се на <a href="tel:077643005">077-643-005</a>.</p></main></noscript></>;
}
