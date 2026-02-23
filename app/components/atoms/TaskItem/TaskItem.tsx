"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MoreHorizontal,
  Check,
  CheckCircle2,
  Clock,
  Circle,
  RotateCcw,
  X,
  Pencil,
  Trash2,
  Mouse,
  MousePointerClick,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Task } from "@/app/types/Task";
import { useTaskStatus } from "@/src/client/services/tasks/useTaskStatus";

const showHint = () => {
  setTimeout(() => {
    toast("Dica rápida", {
      description: (
        <span>
          Toque no <kbd>status</kbd> para alterá-lo · segure <kbd>⋯</kbd> para
          gerenciar
        </span>
      ),
      duration: 4000,
    });
  }, 3000); // aparece após 3s
};

// ── Shared types ──────────────────────────────────────────────────────────────

export interface StatusConfig {
  icon: React.ReactNode;
  dot: string;
  label: string;
}

export type TaskItemVariant = "list" | "calendar";

interface TaskItemProps {
  task: Task;
  isLast: boolean;
  variant?: TaskItemVariant;
  statusConfig?: Record<string, StatusConfig>;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

// ── Calendar-variant visual config ────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-gray-400",
  in_progress: "bg-yellow-400",
  review: "bg-purple-400",
  completed: "bg-green-500",
  cancelled: "bg-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Para Fazer",
  in_progress: "Fazendo",
  review: "Revisando",
  completed: "Finalizada",
  cancelled: "Cancelada",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "completed")
    return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
  if (status === "in_progress")
    return <Clock size={14} className="text-yellow-500 shrink-0" />;
  if (status === "review")
    return <RotateCcw size={14} className="text-purple-500 shrink-0" />;
  if (status === "cancelled")
    return <X size={14} className="text-red-400 shrink-0" />;
  return <Circle size={14} className="text-gray-400 shrink-0" />;
};

const STATUS_ORDER: Task["status"][] = [
  "pending",
  "in_progress",
  "review",
  "completed",
  "cancelled",
];

// ── Mouse-following tooltip ───────────────────────────────────────────────────

const MouseTooltip = ({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), 600);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    if (disabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setVisible(false);
    }
  }, [disabled]);

  return (
    <div
      className="contents"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "fixed",
              top: pos.y - 72,
              left: pos.x + 14,
              pointerEvents: "none",
            }}
            className="z-9999 rounded-lg border border-border/60 bg-popover shadow-md px-3 py-2 space-y-1"
          >
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
              <MousePointerClick size={11} className="shrink-0" />
              Alterar status da tarefa
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
              <Mouse size={11} className="shrink-0" />
              Menu de gerenciamento
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Context menu (right-click desktop / button mobile) ────────────────────────

interface ContextMenuProps {
  open: boolean;
  position?: { x: number; y: number };
  anchor: "fixed" | "bottom";
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu = ({
  open,
  position,
  anchor,
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
          className={`z-50 w-40 rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/10 overflow-hidden ${
            anchor === "bottom" ? "absolute right-0 top-full mt-1.5" : ""
          }`}
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Gerenciar
          </p>
          <ul className="p-1">
            <motion.li whileHover={{ x: 2 }} transition={{ duration: 0.1 }}>
              <button
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              >
                <Pencil size={13} className="shrink-0" />
                <span className="text-xs">Editar</span>
              </button>
            </motion.li>
            <motion.li whileHover={{ x: 2 }} transition={{ duration: 0.1 }}>
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 size={13} className="shrink-0" />
                <span className="text-xs">Excluir</span>
              </button>
            </motion.li>
          </ul>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── Status dropdown ───────────────────────────────────────────────────────────

interface StatusDropdownProps {
  open: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  currentStatus: Task["status"];
  onSelect: (status: Task["status"]) => void;
  statusConfig?: Record<string, StatusConfig>;
}

const StatusDropdown = ({
  open,
  position,
  currentStatus,
  onSelect,
  onClose,
  statusConfig,
}: StatusDropdownProps) => (
  <AnimatePresence>
    {open && (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ position: "fixed", top: position.y, left: position.x }}
          className="z-50 w-44 rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/10 overflow-hidden"
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Alterar status
          </p>
          <ul className="p-1">
            {STATUS_ORDER.filter((s) =>
              statusConfig ? !!statusConfig[s] : true,
            ).map((s) => {
              const isActive = currentStatus === s;
              const dot = statusConfig ? statusConfig[s]?.dot : STATUS_COLOR[s];
              const label = statusConfig
                ? statusConfig[s]?.label
                : STATUS_LABEL[s];
              return (
                <motion.li
                  key={s}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.1 }}
                >
                  <button
                    onClick={() => onSelect(s)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`}
                    />
                    <span className="flex-1 text-left text-xs">{label}</span>
                    {isActive && (
                      <Check size={12} className="text-foreground shrink-0" />
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── Main component ────────────────────────────────────────────────────────────

export const TaskItem = ({
  task,
  isLast,
  variant = "list",
  statusConfig,
  onEdit,
  onDelete,
}: TaskItemProps) => {
  const { mutate: updateStatus, isPending } = useTaskStatus();
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusPos, setStatusPos] = useState({ x: 0, y: 0 });
  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLLIElement>(null);

  const handleStatusClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPending) return;
      setStatusPos({ x: e.clientX, y: e.clientY });
      setStatusOpen((prev) => !prev);
    },
    [isPending],
  );

  const handleStatusChange = (newStatus: Task["status"]) => {
    if (newStatus === task.status) return setStatusOpen(false);
    updateStatus({ taskId: task.id, status: newStatus });
    setStatusOpen(false);
  };

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setStatusOpen(false);
    setContextPos({ x: e.clientX, y: e.clientY });
    setContextOpen(true);
  }, []);

  const openMobileContext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    showHint();
    setStatusOpen(false);
    setContextOpen((prev) => !prev);
  }, []);

  const isCompleted = task.status === "completed";
  const handleEdit = () => onEdit?.(task);
  const handleDelete = () => onDelete?.(task);

  // ── Variant: calendar ──────────────────────────────────────────────────────
  if (variant === "calendar") {
    return (
      <>
        <MouseTooltip disabled={statusOpen}>
          <li
            ref={ref}
            onClick={handleStatusClick}
            onContextMenu={handleContextMenu}
            className={`group relative flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer select-none ${
              isCompleted
                ? "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900"
                : "bg-background border-border hover:bg-muted/30"
            } ${!isLast ? "mb-2" : ""}`}
          >
            {isPending ? (
              <Skeleton className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0" />
            ) : (
              <StatusIcon status={task.status} />
            )}

            <div className="flex-1 min-w-0">
              {isPending ? (
                <Skeleton className="h-3.5 w-36 rounded-md" />
              ) : (
                <p
                  className={`text-xs font-medium leading-tight ${
                    isCompleted
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {task.title}
                </p>
              )}
              {task.description && !isPending && (
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {task.description}
                </p>
              )}
            </div>

            {isPending ? (
              <Skeleton className="h-4 w-16 rounded-full shrink-0" />
            ) : (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full text-white shrink-0 ${
                  STATUS_COLOR[task.status] ?? "bg-gray-400"
                }`}
              >
                {STATUS_LABEL[task.status] ?? task.status}
              </span>
            )}

            {/* Mobile context button */}
            <button
              onClick={openMobileContext}
              className="sm:hidden p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors shrink-0"
            >
              <MoreHorizontal size={13} />
            </button>

            <div className="relative shrink-0">
              <StatusDropdown
                open={statusOpen}
                position={statusPos}
                currentStatus={task.status}
                onSelect={handleStatusChange}
                onClose={() => setStatusOpen(false)}
              />
              <div className="sm:hidden">
                <ContextMenu
                  open={contextOpen}
                  anchor="bottom"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClose={() => setContextOpen(false)}
                />
              </div>
            </div>
          </li>
        </MouseTooltip>

        <div className="hidden sm:block">
          <ContextMenu
            open={contextOpen}
            position={contextPos}
            anchor="fixed"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={() => setContextOpen(false)}
          />
        </div>
      </>
    );
  }

  // ── Variant: list (default) ────────────────────────────────────────────────
  const status = statusConfig?.[task.status] ?? statusConfig?.pending;

  return (
    <>
      <MouseTooltip disabled={statusOpen}>
        <li
          ref={ref}
          onClick={handleStatusClick}
          onContextMenu={handleContextMenu}
          className={`group relative flex sm:grid sm:grid-cols-[1fr_160px_44px] gap-3 items-center px-5 py-3.5 transition-colors hover:bg-muted/30 cursor-pointer select-none ${
            !isLast ? "border-b border-border/60" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="shrink-0">
              {isPending ? (
                <Skeleton className="w-3.75 h-3.75 rounded-full" />
              ) : (
                status?.icon
              )}
            </span>
            {isPending ? (
              <Skeleton className="h-3.5 w-36 rounded-md" />
            ) : (
              <span
                className={`text-sm font-medium truncate transition-all ${
                  isCompleted
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {task.title}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            {isPending ? (
              <Skeleton className="h-3.5 w-20 rounded-md" />
            ) : (
              <>
                <span className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
                <span className="text-xs text-muted-foreground font-medium">
                  {status?.label}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto sm:ml-0 shrink-0 relative flex items-center gap-1">
            {/* Mobile context button */}
            <button
              onClick={openMobileContext}
              className="sm:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>

            {/* Desktop ghost icon (visual hint) */}
            <span className="hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-muted-foreground">
              <MoreHorizontal size={15} />
            </span>

            <div className="relative">
              <StatusDropdown
                open={statusOpen}
                position={statusPos}
                currentStatus={task.status}
                onSelect={handleStatusChange}
                statusConfig={statusConfig}
                onClose={() => setStatusOpen(false)}
              />
              <div className="sm:hidden">
                <ContextMenu
                  open={contextOpen}
                  anchor="bottom"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClose={() => setContextOpen(false)}
                />
              </div>
            </div>
          </div>
        </li>
      </MouseTooltip>

      <div className="hidden sm:block">
        <ContextMenu
          open={contextOpen}
          position={contextPos}
          anchor="fixed"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setContextOpen(false)}
        />
      </div>
    </>
  );
};
