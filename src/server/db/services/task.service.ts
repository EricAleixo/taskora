import { Task } from "@/app/types/Task";
import { projectRepository } from "../repository/project.repository";
import { taskRepository } from "../repository/task.repository";

class TaskService {
  async getTaskById(id: string): Promise<Task> {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    return task;
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error("Usuário inválido");
    }

    return taskRepository.findByUser(userId);
  }

  async getTasksByProject(projectId: string, userId: string): Promise<Task[]> {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não encontrado");
    }

    if (project.userId !== userId) {
      throw new Error("Sem permissão para acessar as tarefas");
    }

    return taskRepository.findByProject(projectId);
  }

  async createTask(
    userId: string,
    data: {
      title: string;
      description?: string | null;
      date: string;
      startTime?: string | null;
      endTime?: string | null;
      duration?: string | null;
      projectId?: string;
      status?: "pending" | "completed" | "in_progress" | "cancelled";
    },
  ): Promise<Task> {
    if (!data.title || data.title.trim().length < 3) {
      throw new Error("Título deve ter no mínimo 3 caracteres");
    }

    if (!data.date) {
      throw new Error("Data é obrigatória");
    }

    // 🔥 Se tiver projeto, validar permissão
    if (data.projectId) {
      const project = await projectRepository.findById(data.projectId);

      if (!project) {
        throw new Error("Projeto não encontrado");
      }

      if (project.userId !== userId) {
        throw new Error("Você não pode adicionar tarefas nesse projeto");
      }
    }

    const task = await taskRepository.create({
      title: data.title.trim(),
      description: data.description ?? null,
      date: data.date,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      duration: data.duration ? Number(data.duration) : null,
      projectId: data.projectId ?? null,
      status: data.status ?? null,
    });

    return task;
  }

  async updateTaskStatus(
    taskId: string,
    status: Task["status"],
  ): Promise<Task> {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    if (task.status === "cancelled") {
      throw new Error("Não é possível alterar uma tarefa cancelada");
    }

    const updated = await taskRepository.updateStatus(taskId, status);

    if (!updated) {
      throw new Error("Erro ao atualizar tarefa");
    }

    return updated;
  }

  async updateTask(
    taskId: string,
    data: Partial<{
      title: string;
      description: string | null;
      date: string;
      startTime: string | null;
      endTime: string | null;
      duration: string | null;
      projectId: string | null;
      status: Task["status"];
    }>,
  ): Promise<Task> {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    const updated = await taskRepository.update(taskId, data);

    if (!updated) {
      throw new Error("Erro ao atualizar tarefa");
    }

    return updated;
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    await taskRepository.delete(taskId);
  }
}

export const taskService = new TaskService();
