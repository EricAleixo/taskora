"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskClientService } from "./task.client.service";

export const useDeleteTask = (projectId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => TaskClientService.delete(id),
    onMutate: async (id) => {
      // Cancela e atualiza otimisticamente a query de tasks global
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any[]) =>
        (old ?? []).filter((task) => task.id !== id),
      );

      // Também atualiza a query de projeto se houver projectId
      let previousProject;
      if (projectId) {
        await queryClient.cancelQueries({ queryKey: ["project", projectId] });
        previousProject = queryClient.getQueryData(["project", projectId]);
        queryClient.setQueryData(["project", projectId], (old: any) => ({
          ...old,
          tasks: (old?.tasks ?? []).filter((task: any) => task.id !== id),
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