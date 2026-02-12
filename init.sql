-- Table: organizations
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at INT NOT NULL,
    icon_name TEXT
);

-- Table: machines
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    is_running INT NOT NULL DEFAULT 0,
    organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Table: tools
CREATE TABLE IF NOT EXISTS tools (
    id VARCHAR(14) PRIMARY KEY,
    type TEXT NOT NULL,
    is_ok FLOAT NOT NULL,
    first_usage INT NOT NULL,
    organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    machine_id INT REFERENCES machines(id) ON DELETE SET NULL
);

-- Table: tool_history
CREATE TABLE IF NOT EXISTS tools_history (
    id SERIAL PRIMARY KEY,
    tool_id VARCHAR(14) NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    start INT NOT NULL,
    "end" INT,
    obrobek_id TEXT NOT NULL,
    korekce TEXT NOT NULL,
    organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    surname TEXT,
    role TEXT NOT NULL,
    organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Table: requests
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Table: verification_codes
CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    identifier TEXT NOT NULL,
    code INT NOT NULL CHECK (code >= 0 AND code <= 999999),
    created_at INT NOT NULL,
    expires_at INT NOT NULL,
    used_at INT,
    UNIQUE (identifier, code)
);
