import { pgEnum } from "drizzle-orm/pg-core";

export const statusTaskEnum = pgEnum("status_task", [
    "pending",
    "completed",
    "in_progress",
    "review",
    "cancelled"
])