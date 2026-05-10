import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { eventsApp } from './routes/events';
import { cors } from 'hono/cors'

// https://hono.dev/docs/api/request#json
const apiApp = new Hono().post(
  ('/'), async (c) => {
    // const body = await c.req.json();

    return c.json({
      ok: true,
    });
  }
).route("/events", eventsApp);

// https://hono.dev/examples/grouping-routes-rpc
// https://hono.dev/docs/api/routing#grouping
const app = new Hono().use(cors()).route("/api", apiApp);

export default app;
export type AppType = typeof app;

showRoutes(app, {
  verbose: true,
})
