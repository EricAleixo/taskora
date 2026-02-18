import { Task } from "@/app/types/Task";
import { eq } from "drizzle-orm";
import { db } from "..";
import { taskTable } from "../schemas";

class TaskRepository {
  async findById(id: number): Promise<Task | null> {
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

  async findByProject(projectId: number): Promise<Task[]> {
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
  projectId?: number | null;
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


  async updateStatus(
    id: number,
    status: Task["status"]
  ): Promise<Task | null> {
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
}

export const taskRepository = new TaskRepository();
