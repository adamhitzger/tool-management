-- Table: machines
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    is_running INT NOT NULL DEFAULT 0
);

-- Table: tools
CREATE TABLE IF NOT EXISTS tools (
    id VARCHAR(14) PRIMARY KEY,
    type TEXT NOT NULL,
    is_ok FLOAT NOT NULL,
    first_usage BIGINT NOT NULL,
    machine_id INT REFERENCES machines(id) ON DELETE SET NULL
);

-- Table: obrobky
CREATE TABLE IF NOT EXISTS obrobky (
    id SERIAL PRIMARY KEY,
    obrobek_id TEXT UNIQUE NOT NULL
);

-- Table: tools_history
CREATE TABLE IF NOT EXISTS tools_history (
    id SERIAL PRIMARY KEY,
    tool_id VARCHAR(14) NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    start BIGINT NOT NULL,
    "end" BIGINT,
    obrobek_id TEXT NOT NULL REFERENCES obrobky(obrobek_id) ON DELETE CASCADE,
    korekce TEXT NOT NULL
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    surname TEXT,
    role TEXT NOT NULL
);

-- Table: requests
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE
);

-- Table: verification_codes
CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    identifier TEXT NOT NULL,
    code INT NOT NULL CHECK (code >= 0 AND code <= 999999),
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    used_at BIGINT,
    UNIQUE (identifier, code)
);

INSERT INTO users (email, name, surname, role)
VALUES ('adam.hitzger@icloud.com', 'Adam', 'Hitzger', 'SUPER_ADMIN');
