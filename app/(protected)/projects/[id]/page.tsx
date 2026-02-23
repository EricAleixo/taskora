import { ProjectShowPage } from "@/app/components/pages/project/ProjectPage";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";
import { projectService } from "@/src/server/db/services/project.service";
import { notFound } from "next/navigation";

export default async function Project({ params }: { params: { id: string } }) {
  const user = await getUserAuthenticate();

  const projectId = (await params).id;
  const project = await projectService.getProjectById(projectId, user.id);

  if(!project) notFound();

  return <ProjectShowPage project={project} />;
}
