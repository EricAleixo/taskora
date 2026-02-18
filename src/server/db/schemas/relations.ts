import { relations } from "drizzle-orm";
import { profileTable } from "./user/Profile.schema";
import { userTable } from "./user/User.schema";
import { projectTable } from "./project/Project.schema";
import { taskTable } from "./task/Task.schema";

export const userRelations = relations(userTable, ({ one }) => ({
  profile: one(profileTable, {
    fields: [userTable.profileId],
    references: [profileTable.id]
  }),
}));

export const projectRelations = relations(projectTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [projectTable.userId],
    references: [userTable.id],
  }),
  tasks: many(taskTable),
}));

export const taskRelations = relations(taskTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [taskTable.projectId],
    references: [projectTable.id],
  }),
}));
