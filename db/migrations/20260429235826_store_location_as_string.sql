-- migrate:up
-- https://neon.com/postgresql/tutorial/change-column-type
ALTER TABLE events
ALTER COLUMN location TYPE TEXT;

-- migrate:down
ALTER TABLE events
ALTER COLUMN location TYPE POINT USING location::point;
