import { Project } from "@/app/types/Project";
import { projectRepository } from "../repository/project.repository";

class ProjectService {
  async getProjectById(
    projectId: number,
    userId: number
  ): Promise<Project> {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não encontrado");
    }

    if (project.userId !== userId) {
      throw new Error("Você não tem permissão para acessar esse projeto");
    }

    return project;
  }

  async getUserProjects(userId: number): Promise<Project[]> {
    return projectRepository.findByUser(userId);
  }

  async createProject(
    userId: number,
    data: {
      title: string;
      description?: string | null;
    }
  ): Promise<Project> {
    // 🔥 regra de negócio

    if (!data.title || data.title.trim().length < 3) {
      throw new Error("Título deve ter no mínimo 3 caracteres");
    }

    const project = await projectRepository.create({
      title: data.title.trim(),
      description: data.description ?? null,
      userId,
    });

    return project;
  }
}

export const projectService = new ProjectService();
