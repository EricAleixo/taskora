import { profileRepository } from "../repository/profile.repository";
import { profileTable } from "../schemas";

class ProfileService {
  async getProfileByUserId(userId: string) {
    const profile = await profileRepository.findByUserId(userId);

    return profile;
  }

  async getProfileById(id: string) {
    const profile = await profileRepository.findById(id);

    return profile;
  }

  async createProfile(
    userId: string,
    data: Omit<typeof profileTable.$inferInsert, "userId">,
  ) {
    return profileRepository.create({
      ...data,
      userId,
    });
  }

  async updateProfile(
    id: string,
    data: Partial<
      typeof profileRepository.update extends (id: any, arg: infer T) => any
        ? T
        : never
    >,
  ) {
    const profile = await profileRepository.update(id, data);

    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    return profile;
  }

  async deleteProfile(id: string) {
    const profile = await profileRepository.delete(id);

    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    return profile;
  }
}

export const profileService = new ProfileService();
