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
-- Insert data into the users table
INSERT INTO users (email, password_hash)
VALUES
    ('user1@example.com', 'hashed_password1'),
    ('user2@example.com', 'hashed_password2'),
    ('user3@example.com', 'hashed_password3');

-- Insert data into the routines table
INSERT INTO routines (user_id, name)
VALUES
    (1, 'Full body'),
    (1, 'Upper body + Lower body'),
    (2, 'Push/Pull/Legs'),
    (3, 'Cardio and Strength');

-- Insert data into the workouts table
INSERT INTO workouts (routine_id, name, days)
VALUES
    (1, 'Full body', 2),
    (2, 'Upper body', 2),
    (2, 'Lower body', 2),
    (3, 'Push', 2),
    (3, 'Pull', 2),
    (3, 'Legs', 2),
    (4, 'Cardio', 3),
    (4, 'Strength', 2);

-- Insert data into the exercises table
INSERT INTO exercises (workout_id, name, sets_min, sets_max, repetitions_min, repetitions_max, rest_seconds_min, rest_seconds_max)
VALUES
    (1, 'Bench Press', 3, 5, 6, 12, 120, 180),
    (1, 'Pull-Ups', 3, 4, 8, 12, 90, 120),
    (1, 'Squats', 3, 5, 6, 12, 120, 180),
    (2, 'Dumbbell Shoulder Press', 3, 4, 8, 12, 90, 120),
    (2, 'Tricep Dips', 3, 4, 8, 12, 90, 120),
    (3, 'Deadlifts', 3, 5, 5, 10, 120, 180),
    (3, 'Leg Press', 3, 4, 10, 15, 90, 120),
    (4, 'Incline Bench Press', 3, 4, 8, 12, 90, 120),
    (4, 'Lateral Raises', 3, 4, 10, 15, 60, 90),
    (5, 'Barbell Rows', 3, 4, 8, 12, 90, 120),
    (5, 'Bicep Curls', 3, 4, 10, 15, 60, 90),
    (6, 'Leg Extensions', 3, 4, 10, 15, 60, 90),
    (6, 'Hamstring Curls', 3, 4, 10, 15, 60, 90),
    (7, 'Treadmill Running', 1, 1, 20, 45, 0, 0),
    (7, 'Cycling', 1, 1, 30, 60, 0, 0),
    (8, 'Bench Press', 3, 4, 6, 12, 120, 180),
    (8, 'Pull-Ups', 3, 4, 8, 12, 90, 120);

-- Insert data into the trackings table
INSERT INTO trackings (exercise_id, date, weight_kg, sets, repetitions, performance)
VALUES
    (1, '2023-04-01', 70, 4, 10, 'Good'),
    (1, '2023-04-08', 72, 4, 9, 'Average'),
    (1, '2023-04-15', 75, 4, 8, 'Excellent'),
    (2, '2023-04-02', 0, 3, 12, 'Good'),
    (2, '2023-04-09', 0, 3, 10, 'Average'),
    (2, '2023-04-16', 0, 3, 11, 'Excellent'),
    (3, '2023-04-03', 80, 4, 10, 'Good'),
    (3, '2023-04-10', 85, 4, 9, 'Average'),
    (3, '2023-04-17', 90, 4, 8, 'Excellent'),
    (4, '2023-04-04', 20, 4, 12, 'Good'),
    (4, '2023-04-11', 22, 4, 11, 'Average'),
    (4, '2023-04-18', 24, 4, 10, 'Excellent'),
    (5, '2023-04-05', 15, 4, 10, 'Good'),
    (5, '2023-04-12', 16, 4, 9, 'Average'),
    (5, '2023-04-19', 17, 4, 8, 'Excellent'),
    (6, '2023-04-06', 100, 4, 10, 'Good'),
    (6, '2023-04-13', 105, 4, 9, 'Average'),
    (6, '2023-04-20', 110, 4, 8, 'Excellent'),
    (7, '2023-04-07', 120, 4, 15, 'Good'),
    (7, '2023-04-14', 125, 4, 14, 'Average'),
    (7, '2023-04-21', 130, 4, 13, 'Excellent'),
    (8, '2023-04-22', 60, 3, 10, 'Good'),
    (8, '2023-04-29', 62, 3, 9, 'Average'),
    (8, '2023-05-06', 65, 3, 8, 'Excellent'),
    (9, '2023-04-23', 10, 3, 15, 'Good'),
    (9, '2023-04-30', 12, 3, 14, 'Average'),
    (9, '2023-05-07', 14, 3, 13, 'Excellent'),
    (10, '2023-04-24', 50, 4, 12, 'Good'),
    (10, '2023-05-01', 52, 4, 11, 'Average'),
    (10, '2023-05-08', 55, 4, 10, 'Excellent'),
    (11, '2023-04-25', 20, 4, 10, 'Good'),
    (11, '2023-05-02', 22, 4, 9, 'Average'),
    (11, '2023-05-09', 24, 4, 8, 'Excellent'),
    (12, '2023-04-26', 25, 4, 15, 'Good'),
    (12, '2023-05-03', 27, 4, 14, 'Average'),
    (12, '2023-05-10', 30, 4, 13, 'Excellent'),
    (13, '2023-04-27', 40, 4, 15, 'Good'),
    (13, '2023-05-04', 42, 4, 14, 'Average'),
    (13, '2023-05-11', 45, 4, 13, 'Excellent'),
    (14, '2023-04-28', 0, 1, 30, 'Good'),
    (14, '2023-05-05', 0, 1, 45, 'Excellent'),
    (15, '2023-04-29', 0, 1, 30, 'Good'),
    (15, '2023-05-06', 0, 1, 60, 'Excellent'),
    (16, '2023-04-30', 70, 4, 10, 'Good'),
    (16, '2023-05-07', 72, 4, 9, 'Average'),
    (16, '2023-05-14', 75, 4, 8, 'Excellent'),
    (17, '2023-05-01', 0, 3, 12, 'Good'),
    (17, '2023-05-08', 0, 3, 10, 'Average'),
    (17, '2023-05-15', 0, 3, 11, 'Excellent');
`);

console.log('seed "init" was executed successfully');

await client.end();
