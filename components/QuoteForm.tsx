'use client';
import { useState } from 'react';

const buyerTypes = ['Individual Consumer', 'Retailer / Distributor', 'Industrial Buyer', 'Government / Tender Buyer', 'Other'];
const productTypes = ['Cat Litter', 'LECA', 'Silica Sand', 'White Pebbles', 'Brown Pebbles', 'Bleaching Earth', 'Soap Adsorbent', 'Multiple Products'];

export default function QuoteForm() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fd, needSpecs: fd.needSpecs === 'on' }) });
    const d = await r.json();
    setMessage(d.message);
    setLoading(false);
  }

  return <form onSubmit={onSubmit} className='glass rounded-3xl p-6 space-y-4'>
    <div className='grid gap-4 sm:grid-cols-2'>
      <Field label='Full name' name='fullName' required />
      <Field label='Company name' name='company' required />
      <Field label='Email' name='email' type='email' required />
      <Field label='Phone' name='phone' required />
      <Select label='Buyer type' name='buyerType' options={buyerTypes} />
      <Select label='Product interest' name='productInterest' options={productTypes} />
      <Field label='Quantity / expected volume' name='quantity' required />
      <Field label='Destination country' name='destinationCountry' required />
    </div>
    <div><label htmlFor='message' className='mb-2 block text-sm subtle'>Message</label><textarea id='message' required name='message' minLength={10} placeholder='Product, specification, timeline, and destination details' className='h-28 w-full rounded-xl border border-white/20 bg-black/20 p-3' /></div>
    <label className='text-sm subtle'><input type='checkbox' name='needSpecs' className='mr-2'/>I would like specification or documentation details.</label>
    <button disabled={loading} className='rounded-full bg-[#c6a56b] px-5 py-3 text-black disabled:opacity-60'>{loading ? 'Sending…' : 'Submit Request'}</button>
    {message && <p role='status' className='text-sm subtle'>{message}</p>}
  </form>;
}

function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <div><label htmlFor={name} className='mb-2 block text-sm subtle'>{label}</label><input id={name} required={required} type={type} name={name} placeholder={label} className='w-full rounded-xl border border-white/20 bg-black/20 p-3' /></div>;
}
function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <div><label htmlFor={name} className='mb-2 block text-sm subtle'>{label}</label><select id={name} name={name} className='w-full rounded-xl border border-white/20 bg-black/20 p-3'>{options.map((x) => <option key={x}>{x}</option>)}</select></div>;
}
