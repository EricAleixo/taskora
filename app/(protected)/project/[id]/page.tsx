import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProjectPage } from "@/app/components/pages/ProjectPage";
import { projectService } from "@/src/server/db/services/project.service";
import { getServerSession } from "next-auth";

export default async function Project({params} : {params: { id: string }}){

    const session = await getServerSession(authOptions);

    if(!session?.user) return;
    const userId = Number(session.user.id);

    const projectId = Number((await params).id);
    const project = await projectService.getProjectById(projectId, userId);

    return <ProjectPage project={project} />;
}