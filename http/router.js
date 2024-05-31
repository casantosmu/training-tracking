import { Router } from "express";
import { sql } from "../db/postgres.js";
import { validate } from "./middlewares/validate.js";
import { HttpError } from "./http-error.js";
import { HTTP_STATUS } from "./http-status.js";

export const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await sql`SELECT routine_id as id, name FROM routines;`;
    res.render("pages/home", { routines: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/routines/:id",
  validate({
    params: {
      type: "object",
      properties: {
        id: { type: "integer" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await sql`
        WITH trackings_agg AS (
          SELECT
            exercise_id,
            json_agg(
              json_build_object(
                'date', date,
                'weightKg', weight_kg,
                'sets', sets,
                'repetitions', repetitions,
                'performance', performance
              )
            ) trackings
            FROM trackings
            GROUP BY exercise_id
        ),
        exercises_agg AS (
          SELECT
            workout_id,
            json_agg(
              json_build_object(
                'id', exercise_id,
                'name', name,
                'restSecondsMin', rest_seconds_min,
                'restSecondsMax', rest_seconds_min,
                'trackings', COALESCE(trackings, '[]')
              )
            ) exercises
            FROM exercises
            LEFT JOIN trackings_agg USING (exercise_id)
            GROUP BY workout_id
        ),
        workouts_agg AS (
          SELECT
            routine_id,
            json_agg(
              json_build_object(
                'name', name,
                'weeklyFrequencyMin', weekly_frequency_min,
                'weeklyFrequencyMax', weekly_frequency_max,
                'exercises', COALESCE(exercises, '[]')
              )
            ) workouts
            FROM workouts
            LEFT JOIN exercises_agg USING (workout_id)
            GROUP BY routine_id 
        )
        SELECT
          name,
          COALESCE(workouts, '[]') workouts
        FROM routines
        LEFT JOIN workouts_agg USING (routine_id)
        WHERE routine_id = ${id};
      `;

      const routine = result.rows[0];

      if (!routine) {
        throw new HttpError(HTTP_STATUS.NOT_FOUND, `Routine ${id} not found`);
      }

      res.render("pages/routine", {
        name: routine.name,
        workouts: routine.workouts.map(
          ({ name, weeklyFrequencyMin, weeklyFrequencyMax, exercises }) => {
            let frequency;
            if (weeklyFrequencyMin === weeklyFrequencyMax) {
              frequency = weeklyFrequencyMin;
            } else {
              frequency = `${weeklyFrequencyMin}-${weeklyFrequencyMax}`;
            }

            return {
              name,
              frequency,
              exercises: exercises.map(
                ({ id, name, restSecondsMin, restSecondsMax, trackings }) => {
                  let minutes;
                  if (restSecondsMin === restSecondsMax) {
                    minutes = restSecondsMin / 60;
                  } else {
                    minutes = `${restSecondsMin / 60}-${restSecondsMax / 60}`;
                  }

                  return { id, name, minutes, trackings };
                },
              ),
            };
          },
        ),
        currentDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/exercises/:id/trackings",
  validate({
    params: {
      type: "object",
      properties: {
        id: { type: "integer" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    body: {
      type: "object",
      properties: {
        date: { type: "string", format: "date" },
        weightKg: { type: "integer", minimum: 0 },
        sets: { type: "integer", minimum: 0 },
        repetitions: { type: "integer", minimum: 0 },
        performance: { type: "string" },
      },
      required: ["date", "weightKg", "sets", "repetitions", "performance"],
      additionalProperties: false,
    },
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { date, weightKg, sets, repetitions, performance } = req.body;

      const result = await sql`
        SELECT
          routine_id as "routineId"
        FROM exercises
        INNER JOIN workouts USING (workout_id)
        WHERE exercise_id = ${id}
        LIMIT 1
      `;

      const exercise = result.rows[0];

      if (!exercise) {
        throw new HttpError(HTTP_STATUS.NOT_FOUND, `Exercise ${id} not found`);
      }

      await sql`
        INSERT INTO trackings (
            exercise_id, date, weight_kg, sets, repetitions, performance
        )
        VALUES (
            ${id}, ${date}, ${weightKg}, ${sets}, ${repetitions}, ${performance}
        );
      `;

      res.redirect(`/routines/${exercise.routineId}`);
    } catch (error) {
      next(error);
    }
  },
);
