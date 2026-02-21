"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskClientService, UpdateTaskDTO } from "./task.client.service";

export const useUpdateTask = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTaskDTO }) =>
      TaskClientService.update(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previous = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => ({
        ...old,
        tasks: (old?.tasks ?? []).map((task: any) =>
          task.id === id ? { ...task, ...payload, isOptimistic: true } : task
        ),
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