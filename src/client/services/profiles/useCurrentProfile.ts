import { useQuery } from "@tanstack/react-query";
import { ProfileClientService } from "./profile.client.service";

export function useCurrentProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      try {
        return await ProfileClientService.getMe();
      } catch (error: any) {
        if (error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}