// https://hono.dev/docs/guides/middleware#extending-the-context-in-middleware
// https://github.com/clerk/javascript/blob/955e9988b1609e50e1286e6af7447edacc4f6acc/packages/hono/README.md
import { createMiddleware } from "hono/factory";
import { DbUser } from "./types/users";
import { getAuth } from "@clerk/hono";
import { sql } from "./db";

const REQUESTS_PER_INTERVAL = 20;

export const userMiddleware = createMiddleware<{
  Variables: {
    user: DbUser;
  };
}>(async (c, next) => {
  const { userId: clerkId } = getAuth(c);
  console.log(`clerk user id: ${clerkId}`)
  if (!clerkId) return c.json({ message: "Unauthorized" }, 401);

  // Try to get the user
  let [user] = await sql<DbUser[]>`
    SELECT * FROM users WHERE clerk_id = ${clerkId}
  `;
  // console.log(`user already in db: ${JSON.stringify(user)}`)

  // Insert if doesn't exist
  // https://neon.com/postgresql/tutorial/upsert
  // "Upsert is a combination of update and insert. The upsert allows you to update an existing row or insert a new one if it doesn’t exist."
  // Postgres only fires RETURNING when a row is written, so we use the no-op SET to force a write on conflict to get the row back
  if (!user) {
    [user] = await sql<DbUser[]>`
      INSERT INTO users (clerk_id)
      VALUES (${clerkId})
      ON CONFLICT (clerk_id) DO UPDATE SET clerk_id = EXCLUDED.clerk_id
      RETURNING *
    `;
  }
  c.set("user", user);
  await next();
});

export const rateLimitMiddleware = createMiddleware<{
  Variables: {
    user: DbUser;
    requestsMadeToday: number;
    rateLimitLastReset: Date;
  };
}>(async (c, next) => {
  const user= c.var.user;

  // if reset time is < now - 24 hours, reset the count and reset time
  const [{count, next_reset}] = await sql<{count: number, next_reset: Date}[]>`
    UPDATE users SET
      requests_made_in_window = CASE 
      WHEN rate_limit_last_reset < (now() - interval '24 hours') THEN 1
      ELSE requests_made_in_window + 1
      END,
      rate_limit_last_reset = CASE 
      WHEN rate_limit_last_reset < (now() - interval '24 hours') THEN now()
      ELSE rate_limit_last_reset
      END
    WHERE id = ${user.id}
    RETURNING requests_made_in_window AS count, rate_limit_last_reset + interval '24 hours' AS next_reset
  `;

  if (count > REQUESTS_PER_INTERVAL) {
    return c.json(
      {
        error: "Rate limit exceeded",
        requestsMadeToday: count,
        nextReset: next_reset,
      },
      429,
    );
  }

  c.set("requestsMadeToday", count);
  c.set("rateLimitLastReset", next_reset);
  await next(); 

});