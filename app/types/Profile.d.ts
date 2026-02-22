export interface Profile {
  id: number;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  timezone: string;
  theme?: string | null;
  receiveEmailNotifications: boolean;
  receivePushNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}