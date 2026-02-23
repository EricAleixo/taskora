import { taskService } from "@/src/server/db/services/task.service";
import { NextResponse } from "next/server";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";

export async function GET(req: Request) {
  try {
    const user = await getUserAuthenticate();
    const tasks = await taskService.getTasksByUser(user.id);

    return NextResponse.json(tasks, { status: 200 });
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
    const user = await getUserAuthenticate();

    const task = await taskService.createTask(user.id, body);

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
