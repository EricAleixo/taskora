import { useQuery } from "@tanstack/react-query";
import { ProfileClientService } from "./profile.client.service";

export function useProfile(id: number) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => ProfileClientService.getById(id),
    enabled: !!id,
  });
}