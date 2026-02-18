import {
  pgTable,
  serial,
  varchar,
  date,
  time,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { statusTaskEnum } from "./Status.schema";
import { projectTable } from "../project/Project.schema";

export const taskTable = pgTable("task", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 80 }).notNull(),
  description: varchar("description", { length: 500 }),

  startTime: time("start_time"),
  endTime: time("end_time"),

  date: date("date").notNull(),

  duration: integer("duration"),

  status: statusTaskEnum("status")
    .default("pending")
    .notNull(),

  projectId: integer("project_id").references(() => projectTable.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
