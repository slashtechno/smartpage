import { Hono } from "hono";
import { createEventInDb } from "../db";
import { SQL } from "bun";
import { sValidator } from '@hono/standard-validator';
import * as z from 'zod';
import { DbEventInsertSchema, eventProcessSchema } from "../types/events";
import asciify from "asciify-image";

// https://hono.dev/docs/api/request#json
// To test:
// curl -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"name":"Test Event","starts_at":"2026-05-01T10:00:00Z","ends_at":"2026-05-01T11:00:00Z","location":"40.7128,-74.0060"}'
export const eventsApp = new Hono().post(
  ('/'),
  sValidator(
    'json',
    DbEventInsertSchema
  ),
  async (c) => {
    const body = c.req.valid('json')
  // https://bun.com/docs/runtime/sql#error-classes
    try {
      const createdEvent = await createEventInDb(
        body
      );
      return c.json({
        createdEvent
      }, 201);
    } catch (error) {
      console.log("error: ", error);
      if (error instanceof SQL.PostgresError) {
        // PostgreSQL-specific error
        console.log(error.code); // PostgreSQL error code
        console.log(error.detail); // Detailed error message
        console.log(error.hint); // Helpful hint from PostgreSQL
      }
      console.log("--end error --");
      return c.json({
        error: "Failed to create event",
      }, 500)
    }
  }
).post(
  ("/process"),
  sValidator(
    'form',
    eventProcessSchema
  ),
  async (c) => {
    console.log("test")
    const body = c.req.valid("form");
    const file = body.image
    const buffer = Buffer.from(await file.arrayBuffer());
    const ascii = await asciify(buffer, { fit: "width", width: 80, color: false });
    console.log(ascii);
    return c.json({ ok: true });
  }
)
  