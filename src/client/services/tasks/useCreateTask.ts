"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskDTO, TaskClientService } from "../tasks/task.client.service";
import { Task } from "@/app/types/Task";

export const useCreateTask = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDTO) => {
      return TaskClientService.create(data)
    },

    // ① Antes da requisição: injeta a tarefa otimista no cache
    onMutate: async (newTask) => {
      // Cancela qualquer refetch em andamento para evitar conflito
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      // Snapshot do estado atual (para rollback)
      const previous = queryClient.getQueryData(["project", projectId]);

      // Tarefa temporária com id negativo (identificável)
      const optimisticTask: Task = {
        id: -Date.now(),
        title: newTask.title,
        description: newTask.description ?? null,
        status: "pending",
        date: newTask.date,
        projectId,
        startTime: null,
        endTime: null,
        duration: null,
        createdAt: new Date(),
        isOptimistic: true,
      };

      // Atualiza o cache diretamente
      queryClient.setQueryData(["project", projectId], (old: any) => ({
        ...old,
        tasks: [...(old?.tasks ?? []), optimisticTask],
      }));

      return { previous }; // contexto para o onError
    },

    // ② Se deu erro, desfaz
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project", projectId], context.previous);
      }
    },

    // ③ Sucesso ou erro: sincroniza com o servidor
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
};
