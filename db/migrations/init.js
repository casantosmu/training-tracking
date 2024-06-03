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
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Routines Table
CREATE TABLE routines (
    routine_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workouts Table
CREATE TABLE workouts (
    workout_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    routine_id INT NOT NULL REFERENCES routines(routine_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weekly_frequency_min INT NOT NULL CHECK (weekly_frequency_min >= 1),
    weekly_frequency_max INT NOT NULL CHECK (weekly_frequency_max >= weekly_frequency_min),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Exercises Table
CREATE TABLE exercises (
    exercise_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_id INT NOT NULL REFERENCES workouts(workout_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sets_min INT NOT NULL CHECK (sets_min >= 1),
    sets_max INT NOT NULL CHECK (sets_max >= sets_min),
    repetitions_min INT NOT NULL CHECK (repetitions_min >= 1),
    repetitions_max INT NOT NULL CHECK (repetitions_max >= repetitions_min),
    rest_seconds_min INT NOT NULL CHECK (rest_seconds_min >= 0),
    rest_seconds_max INT NOT NULL CHECK (rest_seconds_max >= rest_seconds_min),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trackings Table
CREATE TABLE trackings (
    tracking_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exercise_id INT NOT NULL REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg INT NOT NULL CHECK (weight_kg >= 0),
    sets INT NOT NULL CHECK (sets >= 0),
    repetitions INT NOT NULL CHECK (repetitions >= 0),
    performance TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`);

console.log('migration "init" was executed successfully');

await client.end();
