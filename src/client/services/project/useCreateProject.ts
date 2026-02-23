"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProjectDTO, ProjectClientService } from "./project.client.service";
import { Project } from "@/app/types/Project";


export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) => ProjectClientService.create(data),

    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previous = queryClient.getQueryData<Project[]>(["projects"]);

      const optimisticProject: Project = {
        id: String(-Date.now()),
        title: newProject.title,
        description: newProject.description ?? null,
        createdAt: new Date(),
        userId: "0", // preenchido pelo servidor
        tasks: [],
        isOptimistic: true,
      };

      queryClient.setQueryData<Project[]>(["projects"], (old) => [
        ...(old ?? []),
        optimisticProject,
      ]);

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};