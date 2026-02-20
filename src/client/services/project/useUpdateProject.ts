"use client";

import { Project } from "@/app/types/Project";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UpdateProjectDTO,
  ProjectClientService,
} from "./project.client.service";

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, { id: string; data: UpdateProjectDTO }>({
    mutationFn: ({ id, data }) => ProjectClientService.update(id, data),

    onSuccess: (updatedProject, variables) => {
  queryClient.setQueryData(
    ["project", Number(variables.id)],
    (old: Project | undefined) => ({
      ...old,
      ...updatedProject,
      tasks: old?.tasks ?? [],
    })
  );
  queryClient.invalidateQueries({ queryKey: ["projects"] });
}
  });
};
