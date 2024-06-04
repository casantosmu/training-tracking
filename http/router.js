import { Router } from "express";
import { sql } from "../db/postgres.js";
import { validate } from "./middlewares/validate.js";
import { HttpError } from "./http-error.js";
import { HTTP_STATUS } from "./http-status.js";

const USER_ID = 1;

export const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await sql`
      SELECT routine_id as id, name FROM routines WHERE user_id = ${USER_ID};
    `;
    res.render("pages/routines", { routines: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get("/routines/create", async (req, res, next) => {
  try {
    res.render("pages/routine-create");
  } catch (error) {
    next(error);
  }
});

router.post(
  "/routines",
  validate({
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
      additionalProperties: false,
    },
  }),
  async (req, res, next) => {
    try {
      const { name } = req.body;

      const insert = await sql`
        INSERT INTO routines (user_id, name) VALUES (${USER_ID}, ${name}) RETURNING routine_id AS id;
      `;

      const { id } = insert.rows[0];

      res.redirect(`/routines/${id}/edit`);
    } catch (error) {
      next(error);
    }
  },
);

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
                'id', workout_id,
                'name', name,
                'days', days,
                'exercises', COALESCE(exercises, '[]')
              )
            ) workouts
            FROM workouts
            LEFT JOIN exercises_agg USING (workout_id)
            GROUP BY routine_id 
        )
        SELECT
          routine_id id,
          name,
          user_id "userId",
          COALESCE(workouts, '[]') workouts
        FROM routines
        LEFT JOIN workouts_agg USING (routine_id)
        WHERE routine_id = ${id}
        LIMIT 1;
      `;

      const routine = result.rows[0];

      if (!routine) {
        throw new HttpError(HTTP_STATUS.NOT_FOUND, `Routine ${id} not found`);
      }

      if (routine.userId !== USER_ID) {
        throw new HttpError(
          HTTP_STATUS.NOT_FOUND,
          `User ${USER_ID} does not have permission to access routine ${id}.`,
        );
      }

      res.render("pages/routine", {
        id: routine.id,
        name: routine.name,
        workouts: routine.workouts.map(({ id, name, days, exercises }) => {
          return {
            id,
            name,
            days,
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
        }),
        currentDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/routines/:id/edit",
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
        WITH workouts_agg AS (
          SELECT
            routine_id,
            json_agg(
              json_build_object(
                'id', workout_id,
                'name', name
              )
            ) workouts
            FROM workouts
            GROUP BY routine_id 
        )
        SELECT
          routine_id id,
          name,
          user_id "userId",
          COALESCE(workouts, '[]') workouts
        FROM routines
        LEFT JOIN workouts_agg USING (routine_id)
        WHERE routine_id = ${id}
        LIMIT 1;
      `;

      const routine = result.rows[0];

      if (!routine) {
        throw new HttpError(HTTP_STATUS.NOT_FOUND, `Routine ${id} not found`);
      }

      if (routine.userId !== USER_ID) {
        throw new HttpError(
          HTTP_STATUS.NOT_FOUND,
          `User ${USER_ID} does not have permission to access routine ${id}.`,
        );
      }

      res.render("pages/routine-edit", {
        id: routine.id,
        name: routine.name,
        workouts: routine.workouts,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
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
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
      additionalProperties: false,
    },
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const result = await sql`
        SELECT
          user_id "userId"
        FROM routines
        WHERE routine_id = ${id}
        LIMIT 1;
      `;

      const routine = result.rows[0];

      if (!routine) {
        throw new HttpError(HTTP_STATUS.NOT_FOUND, `Routine ${id} not found`);
      }

      if (routine.userId !== USER_ID) {
        throw new HttpError(
          HTTP_STATUS.NOT_FOUND,
          `User ${USER_ID} does not have permission to access routine ${id}.`,
        );
      }

      await sql`
        UPDATE routines
        SET
          name = ${name}
        WHERE routine_id = ${id};
      `;

      res.redirect(`/routines/${id}`);
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
          user_id "userId",
          routine_id "routineId"
        FROM exercises
        INNER JOIN workouts USING (workout_id)
        INNER JOIN routines USING (routine_id)
        WHERE exercise_id = ${id}
        LIMIT 1;
      `;

      const exercise = result.rows[0];

      if (!exercise) {
        throw new HttpError(HTTP_STATUS.NOT_FOUND, `Exercise ${id} not found`);
      }

      if (exercise.userId !== USER_ID) {
        throw new HttpError(
          HTTP_STATUS.NOT_FOUND,
          `User ${USER_ID} does not have permission to access exercise ${id}.`,
        );
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
