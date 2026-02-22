import { profileRepository } from "../repository/profile.repository";

class ProfileService {
  async getProfileByUserId(userId: number) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new Error("Perfil não encontrado para este usuário");
    }

    return profile;
  }

  async getProfileById(id: number) {
    const profile = await profileRepository.findById(id);

    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    return profile;
  }

  async createProfile(data: typeof profileRepository.create extends (
    arg: infer T
  ) => any
    ? T
    : never) {
    return profileRepository.create(data);
  }

  async updateProfile(
    id: number,
    data: Partial<typeof profileRepository.update extends (
      id: any,
      arg: infer T
    ) => any
      ? T
      : never>
  ) {
    const profile = await profileRepository.update(id, data);

    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    return profile;
  }

  async deleteProfile(id: number) {
    const profile = await profileRepository.delete(id);

    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    return profile;
  }
}

export const profileService = new ProfileService();