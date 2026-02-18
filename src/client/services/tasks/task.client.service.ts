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
}

export const TaskClientService = {
  async create(payload: CreateTaskDTO): Promise<Task> {
    const { data } = await api.post<Task>("/tasks", payload);
    return data;
  },
};