import process from "node:process";
import pg from "pg";

const client = new pg.Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

await client.connect();

await client.query(`
-- Users Table
CREATE TABLE users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Routines Table
CREATE TABLE routines (
    routine_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routines_user_id ON routines (user_id);

-- Workouts Table
CREATE TABLE workouts (
    workout_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    routine_id INT NOT NULL REFERENCES routines ON DELETE CASCADE,
    name TEXT NOT NULL,
    days INT NOT NULL CHECK (days >= 1 AND days <= 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_routine_id ON workouts (routine_id);

-- Exercises Table
CREATE TABLE exercises (
    exercise_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_id INT NOT NULL REFERENCES workouts ON DELETE CASCADE,
    name TEXT NOT NULL,
    sets_min INT NOT NULL CHECK (sets_min >= 1),
    sets_max INT NOT NULL CHECK (sets_max >= 1),
    repetitions_min INT NOT NULL CHECK (repetitions_min >= 1),
    repetitions_max INT NOT NULL CHECK (repetitions_max >= 1),
    rest_seconds_min INT NOT NULL CHECK (rest_seconds_min >= 0),
    rest_seconds_max INT NOT NULL CHECK (rest_seconds_max >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (sets_max >= sets_min),
    CHECK (repetitions_max >= repetitions_min),
    CHECK (rest_seconds_max >= rest_seconds_min)
);

CREATE INDEX idx_exercises_workout_id ON exercises (workout_id);

-- Trackings Table
CREATE TABLE trackings (
    tracking_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exercise_id INT NOT NULL REFERENCES exercises ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg INT NOT NULL CHECK (weight_kg >= 0),
    sets INT NOT NULL CHECK (sets >= 0),
    repetitions INT NOT NULL CHECK (repetitions >= 0),
    performance TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trackings_exercise_id ON trackings (exercise_id);
`);

console.log('migration "init" was executed successfully');

await client.end();
