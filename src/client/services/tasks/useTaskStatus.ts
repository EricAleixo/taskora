import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/app/types/Task";
import { TaskClientService } from "./task.client.service";

interface UpdateStatusVariables {
  taskId: string;
  status: Task["status"];
}

export function useTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, UpdateStatusVariables>({
    mutationFn: ({ taskId, status }) =>
      TaskClientService.updateStatus(taskId, status),

    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task>(["task", updatedTask.id], updatedTask);
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) => (t.id === updatedTask.id ? updatedTask : t)) ?? []
      );
      // invalida queries de projeto para refletir na view
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}