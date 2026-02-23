import { eq } from "drizzle-orm";
import { db } from "..";
import { userTable } from "../schemas";
import { User } from "@/app/types/User";

// user.repository.ts
class UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, id),
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const userRepository = new UserRepository();
