"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskClientService, UpdateTaskDTO } from "./task.client.service";

export const useUpdateTask = (projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskDTO }) =>
      TaskClientService.update(id, payload),
    onMutate: async ({ id, payload }) => {
      // Cancela e atualiza otimisticamente a query de tasks global
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any[]) =>
        (old ?? []).map((task) =>
          task.id === id ? { ...task, ...payload, isOptimistic: true } : task,
        ),
      );

      // Também atualiza a query de projeto se houver projectId
      let previousProject;
      if (projectId) {
        await queryClient.cancelQueries({ queryKey: ["project", projectId] });
        previousProject = queryClient.getQueryData(["project", projectId]);
        queryClient.setQueryData(["project", projectId], (old: any) => ({
          ...old,
          tasks: (old?.tasks ?? []).map((task: any) =>
            task.id === id ? { ...task, ...payload, isOptimistic: true } : task,
          ),
        }));
      }

      return { previousTasks, previousProject };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      if (context?.previousProject && projectId) {
        queryClient.setQueryData(["project", projectId], context.previousProject);
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