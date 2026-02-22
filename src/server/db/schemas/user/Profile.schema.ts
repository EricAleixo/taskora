import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  avatarUrl: varchar("avatar_url", { length: 255 }),

  bio: varchar("bio", { length: 255 }),

  timezone: varchar("timezone", { length: 50 })
    .default("America/Sao_Paulo")
    .notNull(),

  theme: varchar("theme", { length: 20 }).default("system"),

  receiveEmailNotifications: boolean("receive_email_notifications")
    .default(true)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
