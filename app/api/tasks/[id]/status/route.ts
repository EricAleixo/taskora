import { Params } from "@/app/types/App";
import { taskService } from "@/src/server/db/services/task.service";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: Params 
) {
  try {
    const body = await req.json();
    const { id } = await params;

    const updated = await taskService.updateTaskStatus(
      id,
      body.status
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.log(error.message)
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
