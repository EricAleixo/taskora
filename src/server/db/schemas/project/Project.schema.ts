// Project.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { userTable } from "../user/User.schema";

export const projectTable = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  userId: uuid("user_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});