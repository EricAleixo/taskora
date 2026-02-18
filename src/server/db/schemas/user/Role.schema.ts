import { pgEnum } from "drizzle-orm/pg-core";

export const roleUserEnum = pgEnum("role", [
  "ADMIN",
  "USER"
]);
