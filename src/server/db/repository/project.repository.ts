import { Project } from "@/app/types/Project";
import { eq } from "drizzle-orm";
import { db } from "..";
import { projectTable } from "../schemas";

class ProjectRepository {
  async findById(id: number): Promise<Project | null> {
    const project = await db.query.projectTable.findFirst({
      where: eq(projectTable.id, id),
      with: {
        tasks: true,
      },
    });

    if (!project) return null;

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      createdAt: project.createdAt,
      userId: project.userId,
      tasks: project.tasks?.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        startTime: task.startTime,
        endTime: task.endTime,
        date: task.date,
        duration: task.duration,
        status: task.status,
        createdAt: task.createdAt,
      })),
    };
  }

  async findByUser(userId: number): Promise<Project[]> {
  const projects = await db.query.projectTable.findMany({
    where: eq(projectTable.userId, userId),
    with: {
      tasks: true,
    },
  });

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    createdAt: project.createdAt,
    userId: project.userId,
    tasks: project.tasks?.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      startTime: task.startTime,
      endTime: task.endTime,
      date: task.date,
      duration: task.duration,
      status: task.status,
      createdAt: task.createdAt,
    })),
  }));
}

  async create(data: {
    title: string;
    description?: string | null;
    userId: number;
  }): Promise<Project> {
    const [project] = await db
      .insert(projectTable)
      .values(data)
      .returning();

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      createdAt: project.createdAt,
      userId: project.userId,
      tasks: [],
    };
  }


}

export const projectRepository = new ProjectRepository();
