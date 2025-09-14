import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";

// This checks if the DATABASE_URL is provided in your environment variables.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to set it up in Vercel?"
  );
}

// Create a new postgres client with the connection string.
const client = postgres(process.env.DATABASE_URL);

// Ensure the transactions table exists so wallet activity can be logged even
// if migrations haven't been run yet. This mirrors the schema definition in
// `shared/schema.ts` and is safe to run multiple times.
await client`
  CREATE TABLE IF NOT EXISTS "transactions" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar NOT NULL REFERENCES "users"("id"),
    "type" varchar NOT NULL,
    "description" text NOT NULL,
    "amount" numeric(10, 2) NOT NULL,
    "created_at" timestamp DEFAULT now()
  );
`;

// Initialize Drizzle with the new client and your schema.
export const db = drizzle(client, { schema });
