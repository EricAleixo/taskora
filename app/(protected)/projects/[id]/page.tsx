import { ProjectShowPage } from "@/app/components/pages/project/ProjectPage";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";
import { projectService } from "@/src/server/db/services/project.service";

export default async function Project({ params }: { params: { id: string } }) {
  const user = await getUserAuthenticate();

  const projectId = (await params).id;
  const project = await projectService.getProjectById(projectId, user.id);

  return <ProjectShowPage project={project} />;
}
