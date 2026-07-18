import { z } from 'zod';

export const loadCreditSchema = z.object({
  amount: z
    .string()
    .min(1, 'Enter an amount')
    .regex(/^\d+$/, 'Enter a whole number'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^254\d{9}$/, 'Use format 254XXXXXXXXX'),
});

export type LoadCreditFormValues = z.infer<typeof loadCreditSchema>;
