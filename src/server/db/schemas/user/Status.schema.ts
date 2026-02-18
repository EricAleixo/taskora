import { pgEnum } from "drizzle-orm/pg-core";

export const statusUserEnum = pgEnum("status_user", [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
]);
