import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { roleUserEnum } from "./Role.schema";

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),

  email: varchar("email", { length: 150 })
    .notNull()
    .unique(),

  password: varchar("password", { length: 255 }),

  role: roleUserEnum("role")
    .default("USER")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});