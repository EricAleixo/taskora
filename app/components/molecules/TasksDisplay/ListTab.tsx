import { Plus, Circle, CircleDot, Eye, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { TaskItem } from "../../atoms/TaskItem/TaskItem";
import { Task } from "@/app/types/Task";
import { TaskForm } from "../../organisms/Modal/TaskForm";
import { DeleteTaskModal } from "../../organisms/Modal/DeleteTaskModal";

interface ListTabProps {
  project: any;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; dot: string }
> = {
  pending: {
    label: "Para Fazer",
    icon: <Circle size={15} className="text-gray-400" />,
    dot: "bg-amber-400",
  },
  in_progress: {
    label: "Em progresso",
    icon: <CircleDot size={15} className="text-blue-400" />,
    dot: "bg-blue-400",
  },
  review: {
    label: "Revisando",
    icon: <Eye size={15} className="text-purple-400" />,
    dot: "bg-purple-400",
  },
  completed: {
    label: "Finalizada",
    icon: <CheckCircle2 size={15} className="text-green-400" />,
    dot: "bg-green-400",
  },
};

const STATUS_ORDER = ["pending", "in_progress", "review", "completed"];

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  },
};

export const ListTab = ({ project }: ListTabProps) => {
  const tasks: Task[] = project.tasks ?? [];

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const filtered =
    activeFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === activeFilter);

  const sorted = [...filtered].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
            activeFilter === "all"
              ? "bg-primary text-background shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Todas
          <span className="ml-1.5 text-xs opacity-60">({tasks.length})</span>
        </button>
        {STATUS_ORDER.map((s) => {
          const cfg = statusConfig[s];
          return (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                activeFilter === s
                  ? "bg-primary text-background shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
              <span className="text-xs opacity-60">({counts[s]})</span>
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1fr_160px_44px] gap-3 px-5 py-3 border-b border-border bg-muted/30">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Tarefa
          </span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Status
          </span>
          <span />
        </div>

        {/* Rows */}
        <AnimatePresence mode="wait">
          {sorted.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2"
            >
              <Circle size={32} className="opacity-20" />
              <p className="text-sm">Nenhuma tarefa encontrada.</p>
            </motion.div>
          ) : (
            <motion.ul
              key={activeFilter}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {sorted.map((task, idx) => (
                <motion.li key={task.id ?? idx} variants={itemVariants}>
                  <TaskItem
                    task={task}
                    isLast={idx === sorted.length - 1}
                    statusConfig={statusConfig}
                    onEdit={(task) => setEditingTask(task)}
                    onDelete={(task) => setDeletingTask(task)}
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Add task row */}
        <button
          onClick={() => setCreatingTask(true)}
          className="w-full flex items-center gap-2.5 px-5 py-3.5 border-t border-border text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors group"
        >
          <Plus
            size={15}
            className="text-muted-foreground group-hover:text-foreground transition-colors"
          />
          Adicionar tarefa
        </button>
      </div>

      {/* Modal: criar */}
      <TaskForm
        projectId={project.id}
        mode="create"
        open={creatingTask}
        onClose={() => setCreatingTask(false)}
      />

      {/* Modal: editar */}
      <TaskForm
        projectId={project.id}
        mode="update"
        taskId={editingTask?.id}
        open={!!editingTask}
        initialValues={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description,
                date: editingTask.date,
                startTime: editingTask.startTime,
                endTime: editingTask.endTime,
                status: editingTask.status,
              }
            : undefined
        }
        onClose={() => setEditingTask(null)}
        onDelete={() => setEditingTask(null)}
      />

      {/* Modal: excluir */}
      {deletingTask && (
        <DeleteTaskModal
          task={deletingTask}
          projectId={project.id}
          open={!!deletingTask}
          onClose={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
};