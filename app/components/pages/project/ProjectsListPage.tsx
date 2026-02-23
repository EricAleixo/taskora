"use client";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeleteProject } from "@/src/client/services/project/useDeleteProject";
import { useState, useRef, useEffect } from "react";
import { CheckSquare, Pencil, Trash2, ListTodo, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuFolderOpen,
  LuSearch,
  LuGrid2X2,
  LuList,
  LuCalendar,
} from "react-icons/lu";
import { MdTrendingUp } from "react-icons/md";
import { Project } from "@/app/types/Project";
import { ProjectModal } from "../../organisms/Modal/ProjectModal";
import { useProjects } from "@/src/client/services/project/useProjects";
import Link from "next/link";
import { toastDeleteProject } from "../../molecules/ToastDeleteProject/ToastDeleteProject";
import { SidebarTrigger } from "@/components/ui/sidebar";

// ─── Delete Confirm Dialog ──────────────────────────────────────────────────────

const DeleteConfirmDialog = ({
  open,
  projectTitle,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  projectTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold text-foreground text-base">
            Excluir projeto
          </h3>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">
              "{projectTitle}"
            </span>
            ? Essa ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
    <div
      className="h-full bg-primary rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
);

// ─── Action Bar ───────────────────────────────────────────────────────────────

const ProjectActionBar = ({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex items-center gap-2 px-5 py-3 bg-muted/50 border-t border-border rounded-b-xl animate-in fade-in slide-in-from-top-1 duration-150">
      <Link
        href={`/projects/${project.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsLoading(true);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ListTodo className="h-3.5 w-3.5" />
        )}
        Tarefas
      </Link>
      {/* Edit — usa o trigger customizado para manter o estilo do action bar */}
      <ProjectModal
        mode="edit"
        initialData={{
          id: String(project.id),
          title: project.title,
          description: project.description ?? undefined,
        }}
        trigger={(open) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            Editar
          </button>
        )}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Excluir
      </button>
    </div>
  );
};

// ─── Project Card ─────────────────────────────────────────────────────────────

const ProjectCard = ({
  project,
  expanded,
  onToggle,
  onDelete,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const total = project.tasks?.length ?? 0;
  const done =
    project.tasks?.filter((t) => t.status === "completed").length ?? 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const isDone = total > 0 && progress === 100;

  return (
    <div
      className={`group relative bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col ${expanded ? "border-primary/40" : "hover:border-primary/30"}`}
      style={{ opacity: project.isOptimistic ? 0.5 : 1 }}
      onClick={onToggle}
    >
      {/* Card body */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 bg-primary" />
            <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </div>
          {isDone && (
            <div className="bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Concluído
            </div>
          )}
        </div>

        {project.description && (
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span
              className={`font-medium ${isDone ? "text-emerald-500" : "text-foreground"}`}
            >
              {progress}%
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" />
            <span className="text-xs">
              {done}/{total} tarefas
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <LuCalendar className="h-3.5 w-3.5" />
            <span className="text-xs">
              {new Date(project.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="action-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <ProjectActionBar project={project} onDelete={onDelete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Project Row ──────────────────────────────────────────────────────────────

const ProjectRow = ({
  project,
  expanded,
  onToggle,
  onDelete,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const total = project.tasks?.length ?? 0;
  const done =
    project.tasks?.filter((t) => t.status === "completed").length ?? 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const isDone = total > 0 && progress === 100;

  return (
    <div
      className={`group bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col ${expanded ? "rounded-t-xl border-primary/40" : "rounded-xl hover:border-primary/30"}`}
      style={{ opacity: project.isOptimistic ? 0.5 : 1 }}
      onClick={onToggle}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-primary" />

        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate block">
            {project.title}
          </span>
          {project.description && (
            <span className="text-xs text-muted-foreground truncate block">
              {project.description}
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 w-36 shrink-0">
          <ProgressBar value={progress} />
          <span
            className={`text-xs font-medium shrink-0 ${isDone ? "text-emerald-500" : "text-muted-foreground"}`}
          >
            {progress}%
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground shrink-0">
          <CheckSquare className="h-3.5 w-3.5" />
          <span className="text-xs">
            {done}/{total}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
          <LuCalendar className="h-3.5 w-3.5" />
          <span className="text-xs hidden sm:block">
            {new Date(project.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      </div>

      {/* Action bar */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="action-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <ProjectActionBar project={project} onDelete={onDelete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) => (
  <div className="bg-card border border-border rounded-xl px-5 py-4 shadow-sm flex items-center gap-4">
    <div
      className={`flex items-center justify-center w-9 h-9 rounded-lg ${accent}`}
    >
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

interface ProjectsListPageProps {
  initialProjects: Project[];
}

export const ProjectsListPage = ({
  initialProjects,
}: ProjectsListPageProps) => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: deleteProject } = useDeleteProject();

  const { data: projects = [] } = useProjects(initialProjects);

  const deletedToastShown = useRef(false);

  useEffect(() => {
    if (searchParams.get("deleted") === "true" && !deletedToastShown.current) {
      deletedToastShown.current = true;
      const title = searchParams.get("title") ?? undefined;
      toastDeleteProject(title);
      const url = new URL(window.location.href);
      url.searchParams.delete("deleted");
      url.searchParams.delete("title");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  // Collapse expanded card when clicking outside
  useEffect(() => {
    if (expandedId === null) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-project-item]")) {
        setExpandedId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expandedId]);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalTasks = projects.reduce(
    (acc, p) => acc + (p.tasks?.length ?? 0),
    0,
  );
  const doneTasks = projects.reduce(
    (acc, p) =>
      acc + (p.tasks?.filter((t) => t.status === "completed").length ?? 0),
    0,
  );
  const doneProjects = projects.filter((p) => {
    const total = p.tasks?.length ?? 0;
    const done = p.tasks?.filter((t) => t.status === "completed").length ?? 0;
    return total > 0 && done === total;
  }).length;

  const handleDelete = (project: Project) => {
    setDeleteTarget(project);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProject(
      { id: String(deleteTarget.id) },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          setExpandedId(null);
        },
        onError: () => {
          toast.error("Erro ao deletar projeto");
        },
      },
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <DeleteConfirmDialog
        open={!!deleteTarget}
        projectTitle={deleteTarget?.title ?? ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
<div className="sticky top-0 z-10 bg-background border-b flex items-center justify-between px-4 md:px-6">
  <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between md:pb-4 flex-1">

    {/* Mobile layout */}
    <div className="flex items-center justify-between md:hidden">
      <SidebarTrigger />
      <nav className="flex items-center gap-2 text-foreground text-lg font-medium absolute left-1/2 -translate-x-1/2">
        <LuFolderOpen className="h-5 w-5" />
        <span>Projetos</span>
      </nav>
      <ProjectModal mode="create" label="Novo Projeto" />
    </div>

    {/* Desktop layout */}
    <nav className="hidden md:flex items-center gap-2 text-muted-foreground text-2xl">
      <LuFolderOpen className="h-7 w-7" />
      <span className="text-foreground font-medium">Projetos</span>
    </nav>
    <div className="hidden md:block">
      <ProjectModal mode="create" label="Novo Projeto" />
    </div>

  </div>
</div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              label="Projetos ativos"
              value={projects.length}
              icon={LuFolderOpen}
              accent="bg-primary/10 text-primary"
            />
            <StatCard
              label="Tarefas concluídas"
              value={`${doneTasks}/${totalTasks}`}
              icon={CheckSquare}
              accent="bg-emerald-500/10 text-emerald-600"
            />
            <StatCard
              label="Projetos finalizados"
              value={doneProjects}
              icon={MdTrendingUp}
              accent="bg-blue-500/10 text-blue-600"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar projeto..."
                className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
              <button
                onClick={() => setView("grid")}
                className={`p-2 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <LuGrid2X2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <LuList className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Projects */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <LuFolderOpen className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">
                Nenhum projeto encontrado.
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((project) => (
                <div key={project.id} data-project-item>
                  <ProjectCard
                    project={project}
                    expanded={expandedId === project.id}
                    onToggle={() => toggleExpand(project.id)}
                    onDelete={() => handleDelete(project)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((project) => (
                <div key={project.id} data-project-item>
                  <ProjectRow
                    project={project}
                    expanded={expandedId === project.id}
                    onToggle={() => toggleExpand(project.id)}
                    onDelete={() => handleDelete(project)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
