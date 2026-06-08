// https://hono.dev/docs/guides/middleware#extending-the-context-in-middleware
// https://github.com/clerk/javascript/blob/955e9988b1609e50e1286e6af7447edacc4f6acc/packages/hono/README.md
import { createMiddleware } from "hono/factory";
import { DbUser } from "./types/users";
import { getAuth } from "@clerk/hono";
import { sql } from "bun";

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
  console.log(`user already in db: ${user}`)

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
