import { Task } from "@/app/types/Task";
import { eq } from "drizzle-orm";
import { db } from "..";
import { projectTable, taskTable } from "../schemas";

class TaskRepository {
  async findById(id: string): Promise<Task | null> {
    const task = await db.query.taskTable.findFirst({
      where: eq(taskTable.id, id),
      with: {
        project: true,
      },
    });

    if (!task) return null;

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      startTime: task.startTime,
      endTime: task.endTime,
      date: task.date,
      duration: task.duration,
      status: task.status,
      createdAt: task.createdAt,
      project: task.project?.title,
    };
  }

  async findByUser(userId: string): Promise<Task[]> {
    const result = await db
      .select()
      .from(taskTable)
      .innerJoin(projectTable, eq(taskTable.projectId, projectTable.id))
      .where(eq(projectTable.userId, userId));

    return result.map(({ task, project }) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      startTime: task.startTime,
      endTime: task.endTime,
      date: task.date,
      duration: task.duration,
      status: task.status,
      createdAt: task.createdAt,
      project: project, // ou o objeto inteiro se preferir
    }));
  }

  async findByProject(projectId: string): Promise<Task[]> {
    const tasks = await db.query.taskTable.findMany({
      where: eq(taskTable.projectId, projectId),
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      startTime: task.startTime,
      endTime: task.endTime,
      date: task.date,
      duration: task.duration,
      status: task.status,
      createdAt: task.createdAt,
    }));
  }

  async create(data: {
    title: string;
    description?: string | null;
    date: string;
    startTime?: string | null;
    endTime?: string | null;
    duration?: number | null;
    status?: Task["status"];
    projectId?: string | null;
  }): Promise<Task> {
    const [task] = await db
      .insert(taskTable)
      .values({
        ...data,
        status: data.status ?? "pending",
      })
      .returning();

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      startTime: task.startTime,
      endTime: task.endTime,
      date: task.date,
      duration: task.duration,
      status: task.status,
      createdAt: task.createdAt,
    };
  }

  async updateStatus(id: string, status: Task["status"]): Promise<Task | null> {
    const [updated] = await db
      .update(taskTable)
      .set({ status })
      .where(eq(taskTable.id, id))
      .returning();

    if (!updated) return null;

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      startTime: updated.startTime,
      endTime: updated.endTime,
      date: updated.date,
      duration: updated.duration,
      status: updated.status,
      createdAt: updated.createdAt,
    };
  }

  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    const updated = await db
      .update(taskTable)
      .set(data)
      .where(eq(taskTable.id, id))
      .returning();

    return updated[0] ?? null;
  }

  async delete(id: string): Promise<void> {
    await db.delete(taskTable).where(eq(taskTable.id, id));
  }
}

export const taskRepository = new TaskRepository();
