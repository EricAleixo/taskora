"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskDTO, TaskClientService } from "../tasks/task.client.service";

export const useCreateTask = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDTO) => TaskClientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
};