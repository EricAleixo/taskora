import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProjectShowPage } from "@/app/components/pages/project/ProjectPage";
import { projectService } from "@/src/server/db/services/project.service";
import { getServerSession } from "next-auth";

export default async function Project({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const projectId = Number((await params).id);
  const project = await projectService.getProjectById(projectId, session.user.id);

  return <ProjectShowPage project={project} />;
}
