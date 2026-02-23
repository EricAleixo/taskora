import { Task } from "@/app/types/Task";
import { api } from "../api";

export interface CreateTaskDTO {
  title: string;
  description?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  projectId?: string;
  status: "pending" | "completed" | "in_progress" | "cancelled" | "review";
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  projectId?: string | null;
  status?: Task["status"];
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

  async updateStatus(taskId: string, status: Task["status"]): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${taskId}/status`, {
      status,
    });
    return data;
  },

  // ✅ UPDATE COMPLETO
  async update(taskId: string, payload: UpdateTaskDTO): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${taskId}`, payload);
    return data;
  },

  // ✅ DELETE
  async delete(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },
};