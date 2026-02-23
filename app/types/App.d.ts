import { InferSelectModel } from "drizzle-orm";
import { profileTable } from "@/db/schema/Profile.schema";
import { userTable } from "@/db/schema/User.schema";

type Profile = InferSelectModel<typeof profileTable>;
type User = InferSelectModel<typeof userTable>;

export type AppSideBarI = {
  profile: Pick<Profile, "name" | "avatarUrl">;
  user: Pick<User, "id" | "email" | "role">;
};