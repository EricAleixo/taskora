import { Project } from "@/app/types/Project";
import { api } from "../api";

export interface CreateProjectDTO {
  title: string;
  description?: string;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
}

export const ProjectClientService = {
  async list(): Promise<Project[]> {
    const { data } = await api.get<Project[]>("/projects");
    return data;
  },

  async getById(id: number): Promise<Project> {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  async create(payload: CreateProjectDTO): Promise<Project> {
    const { data } = await api.post<Project>("/projects", payload);
    return data;
  },

  async update(id: string, payload: UpdateProjectDTO): Promise<Project> {
    const { data } = await api.put<Project>(`/projects/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
