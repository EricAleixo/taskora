import { useQuery } from "@tanstack/react-query";
import { Project } from "@/app/types/Project";
import { ProjectClientService } from "./project.client.service";

export const useProject = (id: number, initialData?: Project) =>
  useQuery({
    queryKey: ["project", id],
    queryFn: () => ProjectClientService.getById(id),
    initialData,
  });