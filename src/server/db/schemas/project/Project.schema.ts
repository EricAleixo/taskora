import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { userTable } from "../user/User.schema";

export const projectTable = pgTable("project", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),

  userId: integer("user_id")
    .references(() => userTable.id, {
      onDelete: "cascade",
    })
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
