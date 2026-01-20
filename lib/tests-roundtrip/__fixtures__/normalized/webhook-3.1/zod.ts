import { z } from 'zod';
// Type Definitions
export type Pet = {
  id: number;
  name: string;
  tag?: string;
};
// Zod Schemas
export const Pet = z
  .object({
    id: z.number().int(),
    name: z.string(),
    tag: z.string().optional(),
  })
  .strict();
