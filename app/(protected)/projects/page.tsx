import { projectService } from "@/src/server/db/services/project.service";
import { ProjectsListPage } from "@/app/components/pages/project/ProjectsListPage";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";

export default async function ProjectsPage() {
  const user = await getUserAuthenticate();
  const projects = await projectService.getUserProjects(user.id);

  return <ProjectsListPage initialProjects={projects} />;
}