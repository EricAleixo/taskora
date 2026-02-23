export interface User {
  id: number;
  email: string;
  role: "USER" | "ADMIN"; // ajuste se houver mais roles
  createdAt: string; // ou Date, dependendo do que você retorna
}

export interface Profile {
  id: number;
  userId: number;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string;
  theme: string;
  receiveEmailNotifications: boolean;
  createdAt: string; // ou Date
  updatedAt: string; // ou Date
}

export interface ProfileWithUser {
  profile: Profile;
  user: User;
}