import { projectService } from "@/src/server/db/services/project.service";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await projectService.getProjectById(
      Number(params.id),
      1 // aqui viria o userId da sessão
    );

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}
