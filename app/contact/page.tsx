import QuoteForm from '@/components/QuoteForm';

export default function ContactPage() {
  return <section className='containerX section-pad pt-32'>
    <h1 className='headline !text-5xl'>Contact / Request Quote</h1>
    <p className='subtle mt-4 max-w-2xl'>Tell us what you need. We’ll help match the right material, specification, and supply path. Or email <a className='text-[#d4b98a]' href='mailto:info@orvixllc.com'>info@orvixllc.com</a>.</p>
    <div className='mt-8 max-w-3xl'><QuoteForm /></div>
  </section>;
}
