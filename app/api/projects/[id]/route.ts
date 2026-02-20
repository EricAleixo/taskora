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
