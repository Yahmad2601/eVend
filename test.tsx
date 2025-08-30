// shared/schema.ts
import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(), // Ensure this line is present and correct
  profileImageUrl: text("profile_image_url"),
  walletBalance: text("wallet_balance").default("0"),
});

// ... rest of the file
