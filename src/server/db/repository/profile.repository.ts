
import { eq } from "drizzle-orm";
import { db } from "..";
import { profileTable, userTable } from "../schemas";

export const profileRepository = {
  async findByUserId(userId: number) {
    const result = await db
      .select({
        profile: profileTable,
      })
      .from(userTable)
      .leftJoin(
        profileTable,
        eq(userTable.profileId, profileTable.id)
      )
      .where(eq(userTable.id, userId));

    if (!result.length || !result[0].profile) {
      return null;
    }

    return result[0].profile;
  },

  async findById(id: number) {
    const [profile] = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.id, id));

    return profile ?? null;
  },

  async create(data: typeof profileTable.$inferInsert) {
    const [profile] = await db
      .insert(profileTable)
      .values(data)
      .returning();

    return profile;
  },

  async update(id: number, data: Partial<typeof profileTable.$inferInsert>) {
    const [profile] = await db
      .update(profileTable)
      .set(data)
      .where(eq(profileTable.id, id))
      .returning();

    return profile ?? null;
  },

  async delete(id: number) {
    const [profile] = await db
      .delete(profileTable)
      .where(eq(profileTable.id, id))
      .returning();

    return profile ?? null;
  },
};