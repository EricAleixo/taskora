import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
} from "drizzle-orm/pg-core";

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  avatarUrl: varchar("avatar_url", { length: 255 }),

  timezone: varchar("timezone", { length: 50 })
    .default("America/Sao_Paulo"),
});
