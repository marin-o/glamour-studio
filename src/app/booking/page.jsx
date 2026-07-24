import BookingExperience from '../../components/booking/BookingExperience';
import { SERVICES } from '../../lib/booking/services.mjs';
import { skopjeToday } from '../../lib/booking/client/booking-flow.mjs';
import { homepageCopy } from '../../lib/homepage-copy';
import { homepageHeroMedia } from '../../lib/homepage-media';

const title = 'Закажување | Glamour Studio';
const description = 'Закажете термин во Glamour Studio во Радовиш. Изберете услуга, датум и слободен термин онлајн.';

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'mk_MK',
    images: [
      {
        url: homepageHeroMedia.src,
        width: homepageHeroMedia.width,
        height: homepageHeroMedia.height,
        alt: homepageCopy.mk.metadata.imageAlt,
      },
    ],
  },
};

export default async function BookingPage({ searchParams }) {
  const params = await searchParams;
  const service = typeof params?.service === 'string' && SERVICES.some((item) => item.id === params.service) ? params.service : '';
  return <><BookingExperience initialServiceId={service} initialSkopjeDate={skopjeToday()} /><noscript><main lang="mk"><h1>Закажување</h1><p>За онлајн закажување потребно е да вклучите JavaScript во вашиот пребарувач. Јавете се на <a href="tel:077643005">077-643-005</a>.</p></main></noscript></>;
}
