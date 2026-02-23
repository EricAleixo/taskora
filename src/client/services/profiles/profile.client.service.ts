import { Profile, ProfileWithUser } from "@/app/types/Profile";
import { api } from "../api";

export interface CreateProfileDTO {
  name: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  theme?: string;
  receiveEmailNotifications?: boolean;
  receivePushNotifications?: boolean;
}

export interface UpdateProfileDTO {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  theme?: string;
  receiveEmailNotifications?: boolean;
  receivePushNotifications?: boolean;
}

export const ProfileClientService = {
  async getMe(): Promise<ProfileWithUser> {
    const { data } = await api.get<ProfileWithUser>("/profile/me");
    return data;
  },

  async getById(id: number): Promise<Profile> {
    const { data } = await api.get<Profile>(`/profile/${id}`);
    return data;
  },

  async create(payload: CreateProfileDTO): Promise<Profile> {
    const { data } = await api.post<Profile>("/profile", payload);
    return data;
  },

  async update(id: string, payload: UpdateProfileDTO): Promise<Profile> {
    const { data } = await api.put<Profile>(`/profile/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/profile/${id}`);
  },
};
