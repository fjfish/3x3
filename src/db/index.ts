import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as {
  connectionPool?: Pool;
  dbInstance?: NodePgDatabase<typeof schema>;
};

const pool =
  globalForDb.connectionPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 5,
  });

const db =
  globalForDb.dbInstance ??
  drizzle(pool, {
    schema,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.connectionPool = pool;
  globalForDb.dbInstance = db;
}

export { db, schema };

