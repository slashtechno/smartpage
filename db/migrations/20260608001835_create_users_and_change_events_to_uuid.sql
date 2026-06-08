-- migrate:up
CREATE TABLE users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   clerk_id TEXT UNIQUE NOT NULL,  -- Clerk's ID, used only for lookup
   created_at TIMESTAMPTZ DEFAULT NOW()
 );

DELETE FROM events WHERE events.user_id = 'unknown';

-- Turn the events ID from serial -> UUID
ALTER TABLE events ADD COLUMN id_new UUID DEFAULT gen_random_uuid();
-- pk constraint needs to be deleted so we can drop the old column
ALTER TABLE events DROP CONSTRAINT events_pkey;
ALTER TABLE events DROP COLUMN id;
-- Rename + promote (https://neon.com/postgresql/tutorial/rename-column)
ALTER TABLE events RENAME column id_new TO id;
-- https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-DESC-ADD-TABLE-CONSTRAINT-USING-INDEX
ALTER TABLE events ADD PRIMARY KEY (id);

-- https://neon.com/postgresql/tutorial/foreign-key#add-a-foreign-key-constraint-to-an-existing-table
-- https://www.postgresql.org/docs/current/tutorial-fk.html
-- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK[
ALTER TABLE events
    -- tries to cast user_id, a string, to a UUID, which will fail if it's not already a uuid. We have no data (we just had 'unknown' earlier and those got deleted) so this is just so it's valid syntax.
    ALTER COLUMN user_id TYPE UUID USING user_id::UUID,
    -- when a user is deleted, delete all their events
    ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX ON events (user_id);


-- migrate:down
DROP INDEX events_user_id_idx;

ALTER TABLE events
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT,
    DROP CONSTRAINT events_user_id_fkey;

-- Reverse UUID -> SERIAL for id (expand/contract in reverse)
ALTER TABLE events DROP CONSTRAINT events_pkey;
ALTER TABLE events ADD COLUMN id_old SERIAL;
ALTER TABLE events DROP COLUMN id;
ALTER TABLE events RENAME COLUMN id_old TO id;
ALTER TABLE events ADD PRIMARY KEY (id);

DROP TABLE users CASCADE;
