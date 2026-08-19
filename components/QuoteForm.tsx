'use client';

import { useId, useRef, useState } from 'react';
import { BUYER_TYPES, PRODUCT_INTERESTS } from '@/lib/form-options';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string; errors?: Record<string, string> };

const DIRECT_EMAIL = 'info@orvixllc.com';

export default function QuoteForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);

  const submitting = status.kind === 'submitting';
  const errors = status.kind === 'error' ? status.errors : undefined;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const entries = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: 'submitting' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entries, needSpecs: entries.needSpecs === 'on' }),
      });

      // A non-JSON body (an HTML error page, a proxy timeout) must not throw
      // past the handler and strand the button on "Sending…" forever.
      let payload: { ok?: boolean; message?: string; errors?: Record<string, string> } = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (response.ok && payload.ok) {
        setStatus({
          kind: 'success',
          message: payload.message ?? 'Thank you. Your request has been received.',
        });
        form.reset();
        return;
      }

      setStatus({
        kind: 'error',
        message:
          payload.message ??
          `We could not submit your request (error ${response.status}). Please email ${DIRECT_EMAIL} directly.`,
        errors: payload.errors,
      });
    } catch {
      // Network failure, offline, DNS, aborted request.
      setStatus({
        kind: 'error',
        message: `We could not reach the server. Check your connection and try again, or email ${DIRECT_EMAIL} directly.`,
      });
    }
  }

  if (status.kind === 'success') {
    return (
      <div className="glass rounded-3xl p-6" role="status" aria-live="polite">
        <h2 className="text-2xl">Request received</h2>
        <p className="subtle mt-3">{status.message}</p>
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-5 rounded-full border border-white/25 px-5 py-3 text-sm"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="glass rounded-3xl p-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="fullName" autoComplete="name" error={errors?.fullName} required />
        <Field label="Company name" name="company" autoComplete="organization" error={errors?.company} required />
        <Field label="Email" name="email" type="email" autoComplete="email" error={errors?.email} required />
        <Field label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" error={errors?.phone} required />
        <Select label="Buyer type" name="buyerType" options={BUYER_TYPES} error={errors?.buyerType} />
        <Select label="Product interest" name="productInterest" options={PRODUCT_INTERESTS} error={errors?.productInterest} />
        <Field label="Quantity / expected volume" name="quantity" error={errors?.quantity} required />
        <Field label="Destination country" name="destinationCountry" autoComplete="country-name" error={errors?.destinationCountry} required />
      </div>

      <TextArea label="Message" name="message" error={errors?.message} />

      <label className="flex items-start gap-2 text-sm subtle">
        <input type="checkbox" name="needSpecs" className="mt-1" />
        <span>I would like specification or documentation details.</span>
      </label>

      {/* Honeypot: hidden from users, and from assistive tech. Bots fill it in. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="rounded-full bg-[#c6a56b] px-5 py-3 text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Submit Request'}
      </button>

      <p role="status" aria-live="polite" className="sr-only">
        {submitting ? 'Sending your request.' : ''}
      </p>

      {status.kind === 'error' && (
        <p role="alert" className="text-sm text-[#f0b8a0]">
          {status.message}
        </p>
      )}
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  required?: boolean;
  error?: string;
}

function Field({ label, name, type = 'text', inputMode, autoComplete, required, error }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm subtle">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-xl border border-white/20 bg-black/20 p-3"
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-[#f0b8a0]">
          {error}
        </p>
      )}
    </div>
  );
}

function TextArea({ label, name, error }: { label: string; name: string; error?: string }) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm subtle">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder="Product, specification, timeline, and destination details"
        className="h-28 w-full rounded-xl border border-white/20 bg-black/20 p-3"
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-[#f0b8a0]">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  label,
  name,
  options,
  error,
}: {
  label: string;
  name: string;
  options: readonly string[];
  error?: string;
}) {
  const errorId = `${name}-error`;
  const fallbackId = useId();
  const id = name || fallbackId;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm subtle">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={options[0]}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-xl border border-white/20 bg-black/20 p-3"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-[#f0b8a0]">
          {error}
        </p>
      )}
    </div>
  );
}
