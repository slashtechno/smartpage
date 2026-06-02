-- migrate:up
ALTER TABLE events ADD COLUMN user_id TEXT;
-- `WHERE user_id IS NULL` isn't technically needed here
UPDATE events SET user_id = 'unknown' WHERE user_id IS NULL;
ALTER TABLE events ALTER COLUMN user_id SET NOT NULL;

-- migrate:down
ALTER TABLE events DROP COLUMN user_id;
