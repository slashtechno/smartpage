import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { eventsApp } from './routes/events';


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
const app = new Hono().route("/api", apiApp);


export default app;

showRoutes(app, {
  verbose: true,
})
