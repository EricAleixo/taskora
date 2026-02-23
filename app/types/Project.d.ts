import { Task } from "./Task";

export type Project = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  userId: string;
  tasks?: Task[];
  isOptimistic?: boolean; // flag interna para optimistic update
};