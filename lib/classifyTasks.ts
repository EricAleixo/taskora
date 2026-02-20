import { Task } from "@/app/types/Task";

export const classifyTasks = (tasks: Task[]) => ({
  toDo: tasks.filter((t) => t.status === "pending"),
  inProgress: tasks.filter((t) => t.status === "in_progress"),
  review: tasks.filter((t) => t.status === "review"),
  done: tasks.filter((t) => t.status === "completed"),
});
