import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, logs } from "@shared/schema";
import * as schema from "@shared/schema";

let db: ReturnType<typeof drizzle>;
let pool: Pool;

export function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not found, using in-memory storage");
    return null;
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    db = drizzle(pool, { schema });
    console.log("Database connection established");
    return db;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return null;
  }
}

export function getDatabase() {
  return db;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  if (!db) return false;
  
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}