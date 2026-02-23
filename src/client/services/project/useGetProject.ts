"use client";
import { useQuery } from "@tanstack/react-query";
import { ProjectClientService } from "./project.client.service";

export const useGetProject = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => ProjectClientService.getById(projectId),
  });
};