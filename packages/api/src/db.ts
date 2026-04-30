// https://bun.com/docs/runtime/sql1
import { sql, SQL } from "bun";
import { DbEvent, DbEventInsert } from "./types/events";

// Bun automatically loads .env and uses (TLS_)POSTGRES_URL (falls back )to (TLS_)DATABASE_URL, PGURL, PG_URL)

// https://bun.com/docs/runtime/sql#inserting-data & https://neon.com/postgresql/tutorial/insert
export async function createEventInDb(eventData: DbEventInsert): Promise<DbEvent> {
  const [eventRecord]: [DbEvent] = await sql`
    INSERT INTO EVENTS ${sql(eventData)}
    RETURNING *
    `;
  return eventRecord;
}
