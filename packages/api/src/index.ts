import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { eventsApp } from "./routes/events";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@clerk/hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

// https://hono.dev/docs/api/request#json
const apiApp = new Hono()
  .post("/", async (c) => {
    return c.json({ ok: true });
  })
  .route("/events", eventsApp);

// https://hono.dev/examples/grouping-routes-rpc
// https://hono.dev/docs/api/routing#grouping
// All middleware and routes must be chained for Hono RPC type inference to work
const app = new Hono()
  .use(cors())
  .use(clerkMiddleware())
  .get("/", (c) => c.json("It's alive!", 218 as ContentfulStatusCode))
  .route("/api", apiApp);

export default app;
export type AppType = typeof app;

showRoutes(app, {
  verbose: true,
});
console.log('CLERK_SECRET_KEY set:', process.env.CLERK_SECRET_KEY?.slice(0, 10) + '...')
