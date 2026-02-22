import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProfileDTO, ProfileClientService } from "./profile.client.service";

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileDTO) =>
      ProfileClientService.create(data),

    onSuccess: (profile) => {
      queryClient.setQueryData(["profile", profile.id], profile);
    },
  });
}