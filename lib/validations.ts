import { z } from 'zod';
export const quoteSchema=z.object({fullName:z.string().min(2),company:z.string().min(1),email:z.string().email(),phone:z.string().min(6),buyerType:z.string().min(1),productInterest:z.string().min(1),quantity:z.string().min(1),destinationCountry:z.string().min(2),message:z.string().min(10),needSpecs:z.boolean().optional()});
