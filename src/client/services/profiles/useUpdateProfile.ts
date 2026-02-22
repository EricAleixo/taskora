import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateProfileDTO, ProfileClientService } from "./profile.client.service";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProfileDTO;
    }) => ProfileClientService.update(id, data),

    onSuccess: (profile) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", profile.id],
      });
    },
  });
}