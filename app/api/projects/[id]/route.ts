import { projectService } from "@/src/server/db/services/project.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session.user.id;

    const project = await projectService.getProjectById(
      Number(id),
      userId
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

    const session = await getServerSession(authOptions);
    const userId = session.user.id;

    const updatedProject = await projectService.updateProject(
      Number(id),
      userId,
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

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

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