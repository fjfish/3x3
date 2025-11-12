import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment.");
}

const url = new URL(connectionString);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  },
});

