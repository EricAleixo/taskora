
"use client"

import { useQuery } from "@tanstack/react-query"
import { ProjectClientService } from "./project.client.service"

export const useProjects = () => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: ProjectClientService.list
    })
}