import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/server/db"; // ajuste para o caminho do seu db
 // ajuste o caminho
import { ilike, eq, and } from "drizzle-orm";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";
import { projectTable, taskTable } from "@/src/server/db/schemas";

/**
 * GET /api/search?q=termo
 *
 * Busca projetos e tarefas pelo título (case-insensitive).
 * Tarefas são filtradas apenas para projetos cujo dono é o usuário logado.
 * Retorna até 5 resultados de cada.
 */
export async function GET(req: NextRequest) {
  const user = await getUserAuthenticate();
  if (!user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ projects: [], tasks: [] });
  }

  const pattern = `%${q}%`;
  const userId = user.id;

  const [projects, tasks] = await Promise.all([
    // Projetos do usuário logado que batem com a busca
    db
      .select({ id: projectTable.id, title: projectTable.title })
      .from(projectTable)
      .where(and(
        eq(projectTable.userId, userId),
        ilike(projectTable.title, pattern),
      ))
      .limit(5),

    // Tarefas cujo projeto pertence ao usuário logado (JOIN task → project)
    db
      .select({
        id: taskTable.id,
        title: taskTable.title,
        status: taskTable.status,
        projectId: taskTable.projectId,
      })
      .from(taskTable)
      .innerJoin(
        projectTable,
        eq(taskTable.projectId, projectTable.id),
      )
      .where(and(
        eq(projectTable.userId, userId),
        ilike(taskTable.title, pattern),
      ))
      .limit(5),
  ]);

  return NextResponse.json({ projects, tasks });
}