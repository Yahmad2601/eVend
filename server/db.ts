import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// This checks if the DATABASE_URL is provided in your environment variables.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to set it up in Vercel?"
  );
}

// Create a new postgres client with the connection string.
const client = postgres(process.env.DATABASE_URL);

// Initialize Drizzle with the new client and your schema.
export const db = drizzle(client, { schema });
