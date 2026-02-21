import { taskService } from "@/src/server/db/services/task.service";
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updated = await taskService.updateTask(
      Number((await params).id),
      body
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await taskService.deleteTask(Number((await params).id));

    return NextResponse.json({ message: "Tarefa deletada com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
