export type User = {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
};
