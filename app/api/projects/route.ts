import { projectService } from "@/src/server/db/services/project.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {

    const session = await getServerSession(authOptions);
    const projectsByUser = await projectService.getUserProjects(session.user.id);

    return NextResponse.json(projectsByUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    const project = await projectService.createProject(
      session!.user.id,
      {
        title: body.title,
        description: body.description,
      }
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.log(error.message)
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
