"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskClientService } from "./task.client.service";

export const useDeleteTask = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => TaskClientService.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previous = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => ({
        ...old,
        tasks: (old?.tasks ?? []).filter((task: any) => task.id !== id),
      }));

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project", projectId], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
};