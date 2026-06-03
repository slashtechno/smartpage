import * as z from "zod";

// Event data that can be taken from untrusted sources (no user_id)
export const EventSafeCreateSchema = z.object({
  name: z.string(),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date().optional(),
  location: z.string().optional(),
});

export const DbEventInsertSchema = EventSafeCreateSchema.extend({
  user_id: z.string(),
});

export const eventProcessSchema = z.object({
  image: z.instanceof(File),
});

export type DbEventInsert = z.infer<typeof DbEventInsertSchema>;

export const DbEventSchema = DbEventInsertSchema.extend({
  id: z.number(),
  created_at: z.date(),
});

// https://www.typescriptlang.org/docs/handbook/utility-types.html
export type DbEvent = z.infer<typeof DbEventSchema>;
