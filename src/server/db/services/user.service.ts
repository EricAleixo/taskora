import { User } from "@/app/types/User";
import { userRepository } from "../server/db/repository/user.repository";

class UserService {
  async getUserById(id: number): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return user;
  }
}

export const userService = new UserService();
