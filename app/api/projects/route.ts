import { projectService } from "@/src/server/db/services/project.service";
import { NextResponse } from "next/server";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";

export async function GET(req: Request) {
  try {
    const user = await getUserAuthenticate();
    const projectsByUser = await projectService.getUserProjects(
      user.id,
    );

    return NextResponse.json(projectsByUser, { status: 200 });
  } catch (error: any) {
    console.log(error.message)
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getUserAuthenticate();

    const project = await projectService.createProject(user.id, {
      title: body.title,
      description: body.description,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
