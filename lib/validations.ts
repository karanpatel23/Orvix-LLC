import { z } from 'zod';
import { BUYER_TYPES, PRODUCT_INTERESTS } from './form-options';

export { BUYER_TYPES, PRODUCT_INTERESTS };

/**
 * Quote request schema.
 *
 * Every string is trimmed and bounded. The previous version had `min()` on each
 * field and no `max()` anywhere, so a single request could carry megabytes of
 * text straight into an email body.
 */

const bounded = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} is required.`, invalid_type_error: `${label} must be text.` })
    .trim()
    .min(min, `${label} must be at least ${min} character${min === 1 ? '' : 's'}.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const quoteSchema = z.object({
  fullName: bounded(2, 120, 'Full name'),
  company: bounded(1, 160, 'Company name'),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .min(1, 'Email is required.')
    .max(254, 'Email must be 254 characters or fewer.')
    .email('Enter a valid email address.'),
  phone: bounded(6, 40, 'Phone'),
  buyerType: z.enum(BUYER_TYPES, {
    errorMap: () => ({ message: 'Select a buyer type from the list.' }),
  }),
  productInterest: z.enum(PRODUCT_INTERESTS, {
    errorMap: () => ({ message: 'Select a product from the list.' }),
  }),
  quantity: bounded(1, 120, 'Quantity'),
  destinationCountry: bounded(2, 80, 'Destination country'),
  message: bounded(10, 4000, 'Message'),
  needSpecs: z.coerce.boolean().optional().default(false),

  /**
   * Honeypot. Hidden from users via CSS and aria-hidden; only a bot fills it in.
   *
   * The schema deliberately ACCEPTS any value here. Rejecting it at validation
   * time would return a 400 that tells the bot exactly which field betrayed it.
   * The route inspects this field instead and answers with a normal-looking 200,
   * so the bot gets no signal to adapt to. Bounded so it cannot be used to
   * smuggle a large payload past the other limits.
   */
  website: z.string().max(200).optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/** Flatten zod issues into { field: firstMessage } for per-field form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in out)) out[key] = issue.message;
  }
  return out;
}
