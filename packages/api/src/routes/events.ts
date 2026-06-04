import { Hono } from "hono";
import { createEventInDb } from "../db";
import { SQL } from "bun";
import { sValidator } from "@hono/standard-validator";
import * as z from "zod";
import { eventProcessSchema, EventSafeCreateSchema } from "../types/events";
import asciify from "asciify-image";
import { getAuth } from "@clerk/hono";
import { callAgent } from "../agent";

// https://hono.dev/docs/api/request#json
// To test:
// curl -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"name":"Test Event","starts_at":"2026-05-01T10:00:00Z","ends_at":"2026-05-01T11:00:00Z","location":"40.7128,-74.0060"}'
export const eventsApp = new Hono()
  .post("/", sValidator("json", EventSafeCreateSchema), async (c) => {
    const { userId } = getAuth(c);
    if (!userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const body = c.req.valid("json");

    // https://bun.com/docs/runtime/sql#error-classes
    try {
      const createdEvent = await createEventInDb({ ...body, user_id: "test" });
      return c.json(
        {
          createdEvent,
        },
        201,
      );
    } catch (error) {
      console.log("error: ", error);
      if (error instanceof SQL.PostgresError) {
        // PostgreSQL-specific error
        console.log(error.code); // PostgreSQL error code
        console.log(error.detail); // Detailed error message
        console.log(error.hint); // Helpful hint from PostgreSQL
      }
      console.log("--end error --");
      return c.json(
        {
          error: "Failed to create event",
        },
        500,
      );
    }
  })
  .post("/process", sValidator("form", eventProcessSchema), async (c) => {
    const { userId } = getAuth(c);
    if (!userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const body = c.req.valid("form");
    const file = body.image;
    const fileArrayBuffer = await file.arrayBuffer();

    const agentResult = await callAgent(fileArrayBuffer, body.timezone);
    console.log(agentResult);

    return c.json({ eventDetails: agentResult });
  });
