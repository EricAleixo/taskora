import { taskService } from "@/src/services/task.service";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await taskService.getTaskById(Number(params.id));

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 404 }
    );
  }
}
