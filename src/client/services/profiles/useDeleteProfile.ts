import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileClientService } from "./profile.client.service";

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProfileClientService.delete(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ["profile", Number(id)],
      });
    },
  });
}