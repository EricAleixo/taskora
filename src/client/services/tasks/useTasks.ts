"use client";

import { useQuery } from "@tanstack/react-query";
import { TaskClientService } from "./task.client.service";
import { Task } from "@/app/types/Task";

export const useTasks = (initialData?: Task[]) => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: TaskClientService.list,
    initialData,
  });
};