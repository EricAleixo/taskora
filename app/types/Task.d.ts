export type Task = {
  id: number;
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  date: string;
  duration: number | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  createdAt: Date;
  project?: string;
};