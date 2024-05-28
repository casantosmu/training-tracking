import pg from "pg";
import { config } from "../lib/config.js";
import { logger } from "../lib/logger.js";

const pool = new pg.Pool({
  host: config.postgres.host,
  port: config.postgres.port,
  user: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database,
});

export const sql = async (strings, ...values) => {
  let text = strings[0];
  for (let i = 1; i < strings.length; i++) {
    text += `$${i}${strings[i]}`;
  }
  const start = Date.now();
  const result = await pool.query(text, values);
  const duration = Date.now() - start;
  logger.debug("Executed query", { text, duration, rows: result.rowCount });
  return result;
};

export const startPostgres = async () => {
  try {
    logger.info("Starting PostgreSQL...");
    await sql`SELECT 1+1`;
    logger.info("PostgreSQL started successfully");
  } catch (error) {
    throw new Error("Error during PostgreSQL start", { cause: error });
  }
};

export const stopPostgres = async () => {
  try {
    logger.info("Stopping PostgreSQL...");
    await pool.end();
    logger.info("PostgreSQL stopped successfully");
  } catch (error) {
    throw new Error("Error during PostgreSQL stop", { cause: error });
  }
};
