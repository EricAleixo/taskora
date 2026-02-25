"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState, useCallback } from "react";
import { MdAccessTime, MdCalendarToday, MdNotes } from "react-icons/md";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { formatDate, formatDateLong, formatDateTime } from "@/lib/formatDate";
import { AnimatePresence, motion } from "framer-motion";
import { TaskForm } from "../../organisms/Modal/TaskForm";
import { useDeleteTask } from "@/src/client/services/tasks/useDeleteTask";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  date: string;
  duration?: number | null;
  status: "pending" | "in_progress" | "completed" | "review";
  createdAt: Date;
  projectId: string;
};

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "bg-yellow-400/20 text-yellow-700 border-yellow-300 dark:bg-yellow-400/25 dark:text-yellow-300 dark:border-yellow-400/50",
  },
  in_progress: {
    label: "Em Progresso",
    color: "bg-blue-400/20 text-blue-700 border-blue-300 dark:bg-blue-400/25 dark:text-blue-300 dark:border-blue-400/50",
  },
  review: {
    label: "Revisando",
    color: "bg-purple-400/20 text-purple-700 border-purple-300 dark:bg-purple-400/25 dark:text-purple-300 dark:border-purple-400/50",
  },
  completed: {
    label: "Concluída",
    color: "bg-green-400/20 text-green-700 border-green-300 dark:bg-green-400/25 dark:text-green-300 dark:border-green-400/50",
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-400/20 text-red-700 border-red-300 dark:bg-red-400/25 dark:text-red-300 dark:border-red-400/50",
  },
};

// ── Context menu ──────────────────────────────────────────────────────────────

interface ContextMenuProps {
  open: boolean;
  position?: { x: number; y: number };
  anchor: "fixed" | "bottom";
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu = ({
  open,
  position,
  anchor,
  onView,
  onEdit,
  onDelete,
  onClose,
}: ContextMenuProps) => (
  <AnimatePresence>
    {open && (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: anchor === "bottom" ? 6 : -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: anchor === "bottom" ? 6 : -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={
            anchor === "fixed" && position
              ? { position: "fixed", top: position.y, left: position.x }
              : {}
          }
          className={`z-50 w-44 rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/10 overflow-hidden ${anchor === "bottom" ? "absolute right-0 top-full mt-1.5" : ""
            }`}
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Opções
          </p>
          <ul className="p-1">
            {[
              {
                label: "Ver detalhes",
                icon: <MdNotes size={13} />,
                onClick: onView,
                danger: false,
              },
              {
                label: "Editar",
                icon: <Pencil size={13} />,
                onClick: onEdit,
                danger: false,
              },
              {
                label: "Excluir",
                icon: <Trash2 size={13} />,
                onClick: onDelete,
                danger: true,
              },
            ].map(({ label, icon, onClick, danger }) => (
              <motion.li
                key={label}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1 }}
              >
                <button
                  onClick={() => {
                    onClick();
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${danger
                      ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                >
                  {icon}
                  <span className="text-xs">{label}</span>
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── CardTask ──────────────────────────────────────────────────────────────────

export const CardTask = ({ task }: { task: Task }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  // projectId vem direto do task — garantia de invalidar o cache correto
  const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask(
    task.projectId,
  );

  const statusInfo = statusConfig[task.status] ?? statusConfig.pending;

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextPos({ x: e.clientX, y: e.clientY });
    setContextOpen(true);
  }, []);

  const openMobileContext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setContextOpen((v) => !v);
  }, []);

  const handleDelete = async () => {
    await deleteTask(task.id);
    // hooks com invalidateQueries já vão revalidar — fechar modais localmente
    setConfirmDelete(false);
    setDetailsOpen(false);
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border border-border/60 bg-card rounded-xl"
        onClick={() => setDetailsOpen(true)}
        onContextMenu={handleContextMenu}
      >
        <CardContent className="px-3.5 py-3 space-y-2.5">
          {/* Title + ⋯ mobile */}
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground flex-1">
              {task.title}
            </p>
            <div className="relative shrink-0 -mr-1 -mt-0.5">
              <button
                onClick={openMobileContext}
                className="sm:hidden p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                <MoreHorizontal size={14} />
              </button>
              <div className="sm:hidden">
                <ContextMenu
                  open={contextOpen}
                  anchor="bottom"
                  onView={() => setDetailsOpen(true)}
                  onEdit={() => setEditOpen(true)}
                  onDelete={() => setConfirmDelete(true)}
                  onClose={() => setContextOpen(false)}
                />
              </div>
            </div>
          </div>

          {/* Badge */}
          <Badge
            variant="outline"
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </Badge>

          {/* Description */}
          {task.description && (
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Date + Time / Duration */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MdCalendarToday className="text-sm shrink-0" />
              <span>{formatDate(task.date)}</span>
            </div>

            {(task.startTime || task.endTime) && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MdAccessTime className="text-sm shrink-0" />
                <span className="font-mono">
                  {task.startTime ?? "--:--"}
                  <span className="mx-1 opacity-40">→</span>
                  {task.endTime ?? "--:--"}
                </span>
              </div>
            )}

            {!task.startTime && !task.endTime && task.duration && (() => {
              const h = Math.floor(task.duration / 60);
              const m = task.duration % 60;
              const label = [h > 0 && `${h}h`, m > 0 && `${m}min`].filter(Boolean).join(" ");
              return (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MdAccessTime className="text-sm shrink-0" />
                  <span>{label}</span>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Desktop right-click context menu */}
      <div className="hidden sm:block">
        <ContextMenu
          open={contextOpen}
          position={contextPos}
          anchor="fixed"
          onView={() => setDetailsOpen(true)}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setConfirmDelete(true)}
          onClose={() => setContextOpen(false)}
        />
      </div>

      {/* Details modal */}
      <TaskDetailsModal
        task={task}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onEdit={() => {
          setDetailsOpen(false);
          setEditOpen(true);
        }}
        onDelete={() => {
          setDetailsOpen(false);
          setConfirmDelete(true);
        }}
      />

      {/* Edit via TaskForm — usa projectId correto e invalida cache */}
      <TaskForm
        projectId={task.projectId}
        mode="update"
        taskId={task.id}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialValues={{
          title: task.title,
          description: task.description,
          date: task.date,
          startTime: task.startTime,
          endTime: task.endTime,
          status: task.status,
        }}
      />

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !isDeleting && setConfirmDelete(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              <div className="px-5 pt-5 pb-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/40">
                    <Trash2 size={15} className="text-rose-500" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Excluir tarefa?
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-10">
                  <span className="font-medium text-foreground">
                    "{task.title}"
                  </span>{" "}
                  será removida permanentemente.
                </p>
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="flex-1 h-9 rounded-lg border border-input text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-9 rounded-lg bg-destructive text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ── TaskDetailsModal ──────────────────────────────────────────────────────────

const TaskDetailsModal = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const statusInfo = statusConfig[task.status] ?? statusConfig.pending;

  const computedDuration = (() => {
    if (!task.startTime || !task.endTime) return task.duration ?? null;
    const [sh, sm] = task.startTime.split(":").map(Number);
    const [eh, em] = task.endTime.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    return diff > 0 ? diff : (task.duration ?? null);
  })();

  const durationLabel = computedDuration
    ? [
      Math.floor(computedDuration / 60) > 0 &&
      `${Math.floor(computedDuration / 60)}h`,
      computedDuration % 60 > 0 && `${computedDuration % 60}min`,
    ]
      .filter(Boolean)
      .join(" ")
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/60">
          <DialogHeader className="space-y-2 pr-6">
            <Badge
              variant="outline"
              className={`w-fit text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </Badge>
            <DialogTitle className="text-base font-semibold leading-snug text-foreground">
              {task.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Criada em {formatDateTime(task.createdAt)}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-5 py-1 divide-y divide-border/50">
          <InfoRow icon={<MdCalendarToday className="h-4 w-4" />} label="Data">
            <span className="text-sm">{formatDateLong(task.date)}</span>
          </InfoRow>

          {(task.startTime || task.endTime) && (
            <InfoRow
              icon={<MdAccessTime className="h-4 w-4" />}
              label="Horário"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono">
                  {task.startTime ?? "--:--"}
                  <span className="mx-1.5 text-muted-foreground/40">→</span>
                  {task.endTime ?? "--:--"}
                </span>
                {durationLabel && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {durationLabel}
                  </span>
                )}
              </div>
            </InfoRow>
          )}

          {!task.startTime && !task.endTime && task.duration && (
            <InfoRow
              icon={<MdAccessTime className="h-4 w-4" />}
              label="Duração"
            >
              <span className="text-sm">{durationLabel}</span>
            </InfoRow>
          )}

          {task.description && (
            <InfoRow icon={<MdNotes className="h-4 w-4" />} label="Descrição">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </InfoRow>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-border/60 bg-muted/20">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 transition-colors"
          >
            <Trash2 size={13} />
            Excluir
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Pencil size={13} />
            Editar tarefa
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── InfoRow ───────────────────────────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-3 py-3">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
      {icon}
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
        {label}
      </span>
      <div className="text-foreground">{children}</div>
    </div>
  </div>
);
