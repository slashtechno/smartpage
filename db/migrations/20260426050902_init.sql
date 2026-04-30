-- migrate:up
--
-- name, desc, datetime start, datetime end, location, owner id(?)
CREATE TABLE events(

id SERIAL PRIMARY KEY,

name TEXT NOT NULL,
description TEXT,
starts_at TIMESTAMPTZ NOT NULL,
ends_at TIMESTAMPTZ,
location POINT -- Use Nominatim (powered by OSM),
);

-- migrate:down
DROP TABLE events CASCADE;
