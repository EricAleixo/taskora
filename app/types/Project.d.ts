export type Project = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  userId: number;
  tasks?: Task[];
};
