import { eq } from "drizzle-orm";
import { db } from "..";
import { profileTable, userTable } from "../schemas";

export const profileRepository = {
  async findByUserId(userId: number) {
    const result = await db
      .select({
        profile: profileTable,
        user: userTable,
      })
      .from(profileTable)
      .innerJoin(userTable, eq(profileTable.userId, userTable.id))
      .where(eq(profileTable.userId, userId));

    if (!result.length) return null;

    return result[0];
  },

  async findById(id: number) {
    const [profile] = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.id, id));

    return profile ?? null;
  },

  async create(
    data: Omit<
      typeof profileTable.$inferInsert,
      "id" | "createdAt" | "updatedAt"
    >,
  ) {
    const [profile] = await db.insert(profileTable).values(data).returning();

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
