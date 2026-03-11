-- ============================================================
--  Gamification Backend — Supabase SQL Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── volunteers ───────────────────────────────────────────────
CREATE TABLE volunteers (
    -- Identity
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    dob              DATE NOT NULL,
    gender           TEXT,
    nationality      TEXT,

    -- Contact
    email            TEXT UNIQUE NOT NULL,
    phone            TEXT,

    -- Address
    city             TEXT,
    state            TEXT,
    country          TEXT,
    pincode          TEXT,

    -- Documents
    aadhar           TEXT,
    pan              TEXT,

    -- Profile
    interests        TEXT,
    password_hash    TEXT NOT NULL,

    -- Gamification
    points           INTEGER DEFAULT 0,
    level            INTEGER DEFAULT 1,
    streak           INTEGER DEFAULT 0,
    events_attended  INTEGER DEFAULT 0,

    created_at       TIMESTAMPTZ DEFAULT NOW()
);


-- ─── ngos ─────────────────────────────────────────────────────
CREATE TABLE ngos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    type                TEXT,
    registration_date   DATE,
    registration_no     TEXT,
    pan                 TEXT,
    tan                 TEXT,
    reg_12a             TEXT,
    official_email      TEXT UNIQUE NOT NULL,
    phone               TEXT,
    website             TEXT,
    address             TEXT,
    city                TEXT,
    state               TEXT,
    pincode             TEXT,
    auth_person_name    TEXT,
    auth_person_mobile  TEXT,
    auth_person_email   TEXT,
    password_hash       TEXT NOT NULL,
    logo_url            TEXT,
    description         TEXT,
    mission             TEXT,
    founded_year        INTEGER,
    total_volunteers    INTEGER DEFAULT 0,
    total_events        INTEGER DEFAULT 0,
    is_verified         BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ─── events ───────────────────────────────────────────────────
CREATE TABLE events (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          TEXT NOT NULL,
    category       TEXT,
    ngo_id         UUID,
    reward_points  INTEGER DEFAULT 50,
    created_at     TIMESTAMP DEFAULT NOW()
);

-- ─── attendance ───────────────────────────────────────────────
CREATE TABLE attendance (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id  UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
    verified      BOOLEAN DEFAULT FALSE,
    UNIQUE(volunteer_id, event_id)
);

-- ─── badges ───────────────────────────────────────────────────
CREATE TABLE badges (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    description      TEXT,
    icon             TEXT,
    condition_type   TEXT NOT NULL,  -- 'events_attended' | 'environment_events'
    condition_value  INTEGER NOT NULL
);

-- ─── volunteer_badges ─────────────────────────────────────────
CREATE TABLE volunteer_badges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id  UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    badge_id      UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at     TIMESTAMP DEFAULT NOW(),
    UNIQUE(volunteer_id, badge_id)
);

-- ─── points_history ───────────────────────────────────────────
CREATE TABLE points_history (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id  UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    action        TEXT NOT NULL,
    points        INTEGER NOT NULL,
    event_id      UUID REFERENCES events(id) ON DELETE SET NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  Seed default badges
-- ============================================================
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
    ('First Event',       'Attended your first event!',              '🎉', 'events_attended',   1),
    ('Active Volunteer',  'Attended 5 or more events.',              '⭐', 'events_attended',   5),
    ('Eco Warrior',       'Attended 3+ environmental events.',       '🌿', 'environment_events', 3);
