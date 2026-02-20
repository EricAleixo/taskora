import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectClientService } from "./project.client.service";


interface DeleteProjectVariables {
  id: string;
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteProjectVariables) =>
      ProjectClientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};