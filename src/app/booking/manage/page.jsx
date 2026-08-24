import BookingManagementExperience from '../../../components/booking/BookingManagementExperience';

export const metadata = Object.freeze({
  title: 'Управување со термин | Glamour Studio',
  description: 'Безбедно управување со потврден термин во Glamour Studio.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
});

export default function BookingManagementPage() {
  return (
    <>
      <BookingManagementExperience />
      <noscript>
        <main lang="mk">
          <h1>Управување со термин</h1>
          <p>За безбедно управување со терминот потребно е да вклучите JavaScript. За промена или откажување, јавете се на <a href="tel:077643005">077-643-005</a>.</p>
        </main>
      </noscript>
    </>
  );
}
