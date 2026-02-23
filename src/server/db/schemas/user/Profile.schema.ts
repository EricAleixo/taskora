// Profile.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { userTable } from "./User.schema";

export const profileTable = pgTable("profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  name: varchar("name", { length: 100 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  bio: varchar("bio", { length: 700 }),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo").notNull(),
  theme: varchar("theme", { length: 20 }).default("system").notNull(),
  receiveEmailNotifications: boolean("receive_email_notifications").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});