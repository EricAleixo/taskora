import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { userTable } from "./User.schema";

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(), // garante 1:1

  name: varchar("name", { length: 100 }).notNull(),

  avatarUrl: varchar("avatar_url", { length: 255 }),

  bio: varchar("bio", { length: 255 }),

  timezone: varchar("timezone", { length: 50 })
    .default("America/Sao_Paulo")
    .notNull(),

  theme: varchar("theme", { length: 20 })
    .default("system")
    .notNull(),

  receiveEmailNotifications: boolean("receive_email_notifications")
    .default(true)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});