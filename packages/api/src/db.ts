import { neon } from "@neondatabase/serverless";
import { DbEvent, DbEventInsert } from "./types/events";

const connectionString = process.env.DATABASE_URL!;
export const sql = neon(connectionString);

// https://neon.com/postgresql/tutorial/insert
export async function createEventInDb(
  eventData: DbEventInsert,
): Promise<DbEvent> {
  const { name, starts_at, ends_at, location, user_id } = eventData;
  const [eventRecord]: [DbEvent] = await sql`
    INSERT INTO EVENTS (name, starts_at, ends_at, location, user_id)
    VALUES (${name}, ${starts_at}, ${ends_at ?? null}, ${location ?? null}, ${user_id})
    RETURNING *
  `;
  return eventRecord;
}
