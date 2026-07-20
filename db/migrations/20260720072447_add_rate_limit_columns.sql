-- migrate:up
ALTER TABLE users 
    ADD COLUMN requests_made_in_window INT DEFAULT 0,
    ADD COLUMN rate_limit_last_reset TIMESTAMPTZ DEFAULT NOW();

-- migrate:down
ALTER TABLE users DROP COLUMN requests_made_in_window;
ALTER TABLE users DROP COLUMN rate_limit_last_reset;
