// app/projects/page.tsx  →  Server Component
import { getServerSession } from "next-auth"; // ajuste para seu auth
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { projectService } from "@/src/server/db/services/project.service";
import { ProjectsListPage } from "@/app/components/pages/project/ProjectsListPage";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const projects = await projectService.getUserProjects(session!.user.id);

  return <ProjectsListPage initialProjects={projects} />;
}