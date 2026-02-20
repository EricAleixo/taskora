"use client";
import { useQuery } from "@tanstack/react-query";
import { ProjectClientService } from "./project.client.service";
import { Project } from "@/app/types/Project";

export const useProjects = (initialData?: Project[]) => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: ProjectClientService.list,
    initialData,
  });
};