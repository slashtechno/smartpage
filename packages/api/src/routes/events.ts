import { Hono } from "hono";
import { createEventInDb } from "../db";
import { NeonDbError } from "@neondatabase/serverless";
import { sValidator } from "@hono/standard-validator";
import * as z from "zod";
import { eventProcessSchema, EventSafeCreateSchema } from "../types/events";
import { verify } from "hono/jwt";
import { callAgent } from "../agent";
import { userMiddleware } from "../middleware";import { JWT_SECRET } from "../storage";
import { UploadJwtPayload } from "../types/misc";
import { del, get } from "@vercel/blob";

// https://hono.dev/docs/api/request#json
// To test:
// curl -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"name":"Test Event","starts_at":"2026-05-01T10:00:00Z","ends_at":"2026-05-01T11:00:00Z","location":"40.7128,-74.0060"}'
export const eventsApp = new Hono()
  .post("/", userMiddleware, sValidator("json", EventSafeCreateSchema), async (c) => {
  // .var and .get are basically the same, just dot notation and string keys respectively

    const user = c.var.user
    const body = c.req.valid("json");

    // https://bun.com/docs/runtime/sql#error-classes
    try {
      const createdEvent = await createEventInDb({ ...body, user_id: user.id });
      return c.json(
        {
          createdEvent,
        },
        201,
      );
    } catch (error) {
      console.log("error: ", error);
      if (error instanceof NeonDbError) {
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
  .post("/process", userMiddleware, sValidator("form", eventProcessSchema), async (c) => {
    const user = c.var.user
    const body = c.req.valid("form");

// Verify the jwt and get the uploadPath
const {uploadPath, sub} = await verify(body.uploadJwt, JWT_SECRET, "HS256") as UploadJwtPayload;
// Make sure the sub in the jwt matches the user making the request
if (sub !== user.id) {
  return c.json({ error: "Unauthorized" }, 403)
}

// Download the file from the uploadPath in blob storage
// (should auto-load blob env vars)
const result = await get(uploadPath, {access: 'private'});
if (result?.statusCode !== 200) {
  return c.json({ error: "Failed to download file from blob storage" }, 500)
}
  // Response is a class that needs `new` to be instantiated
  // When the get() call was made, data started flowing.
  // The ReadabelStream is the open connection to the blob storage
  // Response's constructor stores the ReadableStream. in the instance, and when we call .arrayBuffer() on the instance, it reads the stream to completion and returns an ArrayBuffer.
  const fileArrayBuffer = await new Response(result.stream).arrayBuffer();

  // Delete the file from blob storage after downloading it
  await del([uploadPath]);

    const agentResult = await callAgent(fileArrayBuffer, body.timezone);
    console.log(agentResult);

    return c.json({ eventDetails: agentResult });
  });
