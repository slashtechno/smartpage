// https://bun.com/docs/runtime/sql1
import { sql } from "bun";
import { DbEvent, DbEventInsert } from "./types/events";

export { sql };

// Bun automatically loads .env and uses (TLS_)POSTGRES_URL (falls back to (TLS_)DATABASE_URL, PGURL, PG_URL)

// https://bun.com/docs/runtime/sql#inserting-data & https://neon.com/postgresql/tutorial/insert
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
