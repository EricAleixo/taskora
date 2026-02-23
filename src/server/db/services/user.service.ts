import { User } from "@/app/types/User";
import { userRepository } from "../repository/user.repository";

class UserService {
  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return user;
  }
}

export const userService = new UserService();
