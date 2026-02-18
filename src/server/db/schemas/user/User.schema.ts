import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { roleUserEnum } from "./Role.schema";
import { profileTable } from "./Profile.schema";

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),

  email: varchar("email", { length: 150 })
    .notNull()
    .unique(),

  password: varchar("password", { length: 255 }),

  profileId: integer("profile_id").references(() => profileTable.id, {
    onDelete: "cascade"
  }),

  role: roleUserEnum("role")
    .default("USER")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});
