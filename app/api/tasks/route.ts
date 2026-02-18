import { taskService } from "@/src/server/db/services/task.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {

    return NextResponse.json("Olá!", { status: 200 });
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

    const task = await taskService.createTask(body.projectId, body);

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
