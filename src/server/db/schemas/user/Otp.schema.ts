import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const otpTable = pgTable("otp_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(), // guarda a senha hasheada temporariamente
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});