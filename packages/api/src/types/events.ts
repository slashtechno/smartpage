import * as z from 'zod'

export const DbEventInsertSchema = z.object({
  name: z.string(),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date().optional(),
  location: z.string().optional(),
});

export type DbEventInsert = z.infer<typeof DbEventInsertSchema>;

// https://www.typescriptlang.org/docs/handbook/utility-types.html
export type DbEvent = DbEventInsert & {
  id: number,
  created_at: Date
};
