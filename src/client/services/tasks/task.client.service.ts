import { Task } from "@/app/types/Task";
import { api } from "../api"; // mesmo padrão do ProjectClientService

export interface CreateTaskDTO {
  title: string;
  description?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  projectId?: number;
  status: "pending" | "completed" | "in_progress" | "cancelled" | "review";
}

export const TaskClientService = {
  async create(payload: CreateTaskDTO): Promise<Task> {
    const { data } = await api.post<Task>("/tasks", payload);
    return data;
  },

  async list(): Promise<Task[]> {
    const { data } = await api.get<Task[]>("/tasks");
    return data;
  },

  async updateStatus(taskId: number, status: Task["status"]): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${taskId}/status`, {
      status,
    });
    return data;
  },
};
