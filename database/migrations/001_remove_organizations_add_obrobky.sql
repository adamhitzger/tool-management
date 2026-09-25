-- Migrace stávající DB: odstranění organizací + tabulka obrobky
-- Spuštění: docker exec -i postgres_db psql -U postgres -d app -v ON_ERROR_STOP=1 < database/migrations/001_remove_organizations_add_obrobky.sql
BEGIN;

-- 1) Tabulka obrobky + backfill ze stávající historie
CREATE TABLE IF NOT EXISTS obrobky (
    id SERIAL PRIMARY KEY,
    obrobek_id TEXT UNIQUE NOT NULL
);

INSERT INTO obrobky (obrobek_id)
SELECT DISTINCT obrobek_id FROM tools_history
ON CONFLICT (obrobek_id) DO NOTHING;

ALTER TABLE tools_history
    ADD CONSTRAINT tools_history_obrobek_id_fkey
    FOREIGN KEY (obrobek_id) REFERENCES obrobky(obrobek_id) ON DELETE CASCADE;

-- 2) Odstranění organizací
ALTER TABLE tools_history DROP COLUMN IF EXISTS organization_id;
ALTER TABLE tools DROP COLUMN IF EXISTS organization_id;
ALTER TABLE machines DROP COLUMN IF EXISTS organization_id;
ALTER TABLE users DROP COLUMN IF EXISTS organization_id;
ALTER TABLE requests DROP COLUMN IF EXISTS organization_id;

DROP TABLE IF EXISTS organizations;

COMMIT;
