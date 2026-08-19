/**
 * Shared option lists for the quote form.
 *
 * These live apart from lib/validations.ts on purpose: QuoteForm is a client
 * component, and importing them from the schema module pulled the whole of zod
 * into the browser bundle (+13 kB on /contact for two string arrays).
 */

export const BUYER_TYPES = [
  'Individual Consumer',
  'Retailer / Distributor',
  'Industrial Buyer',
  'Government / Tender Buyer',
  'Other',
] as const;

export const PRODUCT_INTERESTS = [
  'Cat Litter',
  'LECA',
  'Silica Sand',
  'White Pebbles',
  'Brown Pebbles',
  'Bleaching Earth',
  'Soap Adsorbent',
  'Multiple Products',
] as const;
