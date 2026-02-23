import { projectService } from "@/src/server/db/services/project.service";
import { NextResponse } from "next/server";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const user = await getUserAuthenticate();

    const project = await projectService.getProjectById(
      Number(id),
      user.id
    );

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const user = await getUserAuthenticate();

    const updatedProject = await projectService.updateProject(
      Number(id),
      user.id,
      {
        title: body.title,
        description: body.description,
      }
    );

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const user = await getUserAuthenticate();

    if (!user) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      );
    }

    const userId = user.id;

    await projectService.deleteProject(Number(id), userId);

    return NextResponse.json(
      { message: "Projeto deletado com sucesso" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}