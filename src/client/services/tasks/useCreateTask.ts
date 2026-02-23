"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskClientService } from "./task.client.service";

export const useCreateTask = (projectId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof TaskClientService.create>[0]) =>
      TaskClientService.create(payload),
    onSuccess: (newTask) => {
      // Atualiza otimisticamente a lista global de tasks
      queryClient.setQueryData(["tasks"], (old: any[]) =>
        old ? [newTask, ...old] : [newTask],
      );

      // Atualiza também a query de projeto se houver projectId
      if (projectId) {
        queryClient.setQueryData(["project", projectId], (old: any) => ({
          ...old,
          tasks: [newTask, ...(old?.tasks ?? [])],
        }));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      }
    },
  });
};