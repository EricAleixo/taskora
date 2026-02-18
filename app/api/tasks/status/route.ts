import { taskService } from "@/src/services/task.service";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updated = await taskService.updateTaskStatus(
      Number(params.id),
      body.status
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
