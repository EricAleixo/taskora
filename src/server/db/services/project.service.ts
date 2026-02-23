import { Project } from "@/app/types/Project";
import { projectRepository } from "../repository/project.repository";

class ProjectService {
  async getProjectById(projectId: string, userId: string): Promise<Project> {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não encontrado");
    }

    if (project.userId !== userId) {
      throw new Error("Você não tem permissão para acessar esse projeto");
    }

    return project;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return projectRepository.findByUser(userId);
  }

  async createProject(
    userId: string,
    data: {
      title: string;
      description?: string | null;
    },
  ): Promise<Project> {
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

  async updateProject(
    projectId: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
    },
  ): Promise<Project> {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não encontrado");
    }

    if (project.userId !== userId) {
      throw new Error("Você não tem permissão para editar esse projeto");
    }

    if (data.title !== undefined) {
      if (data.title.trim().length < 3) {
        throw new Error("Título deve ter no mínimo 3 caracteres");
      }

      data.title = data.title.trim();
    }

    const updated = await projectRepository.update(projectId, data);

    if (!updated) {
      throw new Error("Erro ao atualizar projeto");
    }

    return updated;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não encontrado");
    }

    if (project.userId !== userId) {
      throw new Error("Você não tem permissão para deletar esse projeto");
    }

    const deleted = await projectRepository.delete(projectId);

    if (!deleted) {
      throw new Error("Erro ao deletar projeto");
    }
  }
}

export const projectService = new ProjectService();
