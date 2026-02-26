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
  CalendarClock,
  CalendarX,
  Timer,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";
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
  }, 3000);
};

// ── Shared types ──────────────────────────────────────────────────────────────

export interface StatusConfig {
  icon: React.ReactNode;
  dot: string;
  label: string;
}

export type TaskItemVariant = "list" | "calendar";

interface MotionProps {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
}

interface TaskItemProps {
  task: Task;
  isLast: boolean;
  variant?: TaskItemVariant;
  statusConfig?: Record<string, StatusConfig>;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  /** Props de animação explícitas (initial/animate/exit) vindas do pai */
  motionProps?: MotionProps;
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

// ── Temporal urgency logic ────────────────────────────────────────────────────

type TimePhase =
  | "overdue"
  | "critical"
  | "urgent"
  | "soon"
  | "active"
  | "future"
  | "none";

interface TemporalInfo {
  phase: TimePhase;
  startDate: Date | null;
  endDate: Date | null;
  startLabel: string | null;
  endLabel: string | null;
  relativeLabel: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

const combineDateTime = (
  dateStr: string | null | undefined,
  timeStr: string | null | undefined,
): Date | null => {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes, seconds = 0] = timeStr.split(":").map(Number);
  if ([year, month, day, hours, minutes].some(isNaN)) return null;
  const d = new Date(year, month - 1, day, hours, minutes, seconds);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (d: Date): string => {
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (isToday) return `Hoje, ${time}`;
  const day = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  return `${day} · ${time}`;
};

const relativeTime = (d: Date, now: Date, isFuture: boolean): string => {
  const diffMs = Math.abs(d.getTime() - now.getTime());
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `${isFuture ? "Começa em" : "Termina em"} ${diffD}d ${pad(diffH % 24)}h`;
  if (diffH > 0) return `${isFuture ? "Começa em" : "Termina em"} ${diffH}h ${pad(diffMin % 60)}min`;
  if (diffMin > 0) return `${isFuture ? "Começa em" : "Termina em"} ${diffMin}min`;
  return isFuture ? "Começa agora" : "Encerrou agora";
};

function useTemporalInfo(task: Task): TemporalInfo {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const startDate = combineDateTime(task.date, task.startTime);
  const endDate = combineDateTime(task.date, task.endTime);

  if (!startDate && !endDate) {
    return { phase: "none", startDate: null, endDate: null, startLabel: null, endLabel: null, relativeLabel: null };
  }

  const isCompleted = task.status === "completed" || task.status === "cancelled";
  let phase: TimePhase = "none";
  let relativeLabel: string | null = null;

  if (!isCompleted) {
    if (endDate && now > endDate) {
      phase = "overdue";
      const diffMs = now.getTime() - endDate.getTime();
      const diffMin = Math.floor(diffMs / 60_000);
      const diffH = Math.floor(diffMin / 60);
      const diffD = Math.floor(diffH / 24);
      if (diffD > 0) relativeLabel = `Atrasada há ${diffD}d`;
      else if (diffH > 0) relativeLabel = `Atrasada há ${diffH}h`;
      else relativeLabel = `Atrasada há ${diffMin}min`;
    } else if (endDate) {
      const msLeft = endDate.getTime() - now.getTime();
      const minLeft = Math.floor(msLeft / 60_000);
      if (minLeft <= 30) { phase = "critical"; relativeLabel = relativeTime(endDate, now, false); }
      else if (minLeft <= 120) { phase = "urgent"; relativeLabel = relativeTime(endDate, now, false); }
      else if (msLeft <= 24 * 60 * 60_000) { phase = "soon"; relativeLabel = relativeTime(endDate, now, false); }
      else if (startDate && now >= startDate) { phase = "active"; relativeLabel = relativeTime(endDate, now, false); }
      else { phase = "future"; relativeLabel = startDate ? relativeTime(startDate, now, true) : null; }
    } else if (startDate) {
      phase = now >= startDate ? "active" : "future";
      if (phase === "future") relativeLabel = relativeTime(startDate, now, true);
    }
  }

  return {
    phase,
    startDate,
    endDate,
    startLabel: startDate ? formatDateTime(startDate) : null,
    endLabel: endDate ? formatDateTime(endDate) : null,
    relativeLabel,
  };
}

// ── Phase styles ──────────────────────────────────────────────────────────────

const PHASE_STYLES: Record<TimePhase, { bar: string; badge: string; text: string; dot: string; pulse?: boolean; icon: React.ElementType }> = {
  overdue:  { bar: "bg-red-500",    badge: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",           text: "text-red-600 dark:text-red-400",       dot: "bg-red-500",    pulse: true, icon: CalendarX },
  critical: { bar: "bg-orange-500", badge: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", pulse: true, icon: Timer },
  urgent:   { bar: "bg-amber-400",  badge: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",   text: "text-amber-600 dark:text-amber-500",   dot: "bg-amber-400",  icon: Clock },
  soon:     { bar: "bg-yellow-300", badge: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/50", text: "text-yellow-600 dark:text-yellow-500", dot: "bg-yellow-400", icon: CalendarClock },
  active:   { bar: "bg-blue-400",   badge: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/50",   text: "text-blue-600 dark:text-blue-400",     dot: "bg-blue-400",   icon: CalendarClock },
  future:   { bar: "bg-gray-300 dark:bg-gray-600", badge: "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400", icon: CalendarClock },
  none:     { bar: "bg-transparent", badge: "", text: "", dot: "", icon: CalendarClock },
};

// ── TimeBadge ─────────────────────────────────────────────────────────────────

const TimeBadge = ({ info, mode }: { info: TemporalInfo; mode: "compact" | "full" }) => {
  if (info.phase === "none") return null;
  const s = PHASE_STYLES[info.phase];
  const Icon = s.icon;
  const dot = (
    <span className="relative flex h-1.5 w-1.5">
      {s.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${s.dot}`} />}
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
    </span>
  );

  if (mode === "compact") {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${s.badge} ${s.text}`}>
        {dot}
        {info.relativeLabel ?? info.endLabel ?? info.startLabel}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium ${s.badge} ${s.text}`}>
      <Icon size={10} className="shrink-0" />
      {info.startLabel && <span>{info.startLabel}</span>}
      {info.startLabel && info.endLabel && <ArrowRight size={9} className="shrink-0 opacity-60" />}
      {info.endLabel && <span>{info.endLabel}</span>}
      {info.relativeLabel && (
        <>
          <span className="opacity-40 mx-0.5">·</span>
          <span className="flex items-center gap-1">{s.pulse && dot}{info.relativeLabel}</span>
        </>
      )}
    </div>
  );
};

// ── UrgencyBar ────────────────────────────────────────────────────────────────

const UrgencyBar = ({ phase }: { phase: TimePhase }) => {
  if (phase === "none" || phase === "future") return null;
  return <span className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full ${PHASE_STYLES[phase].bar} transition-colors duration-700`} />;
};

// ── MouseTooltip ──────────────────────────────────────────────────────────────

const MouseTooltip = ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
  const handleMouseEnter = () => { if (disabled) return; timerRef.current = setTimeout(() => setVisible(true), 600); };
  const handleMouseLeave = () => { if (timerRef.current) clearTimeout(timerRef.current); setVisible(false); };

  useEffect(() => {
    if (disabled) { if (timerRef.current) clearTimeout(timerRef.current); setVisible(false); }
  }, [disabled]);

  return (
    <div className="contents" onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{ position: "fixed", top: pos.y - 72, left: pos.x + 14, pointerEvents: "none" }}
            className="z-[9999] rounded-lg border border-border/60 bg-popover shadow-md px-3 py-2 space-y-1"
          >
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
              <MousePointerClick size={11} className="shrink-0" />Alterar status da tarefa
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
              <Mouse size={11} className="shrink-0" />Menu de gerenciamento
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── ContextMenu ───────────────────────────────────────────────────────────────

interface ContextMenuProps {
  open: boolean; position?: { x: number; y: number }; anchor: "fixed" | "bottom";
  onEdit: () => void; onDelete: () => void; onClose: () => void;
}

const ContextMenu = ({ open, position, anchor, onEdit, onDelete, onClose }: ContextMenuProps) => (
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
          style={anchor === "fixed" && position ? { position: "fixed", top: position.y, left: position.x } : {}}
          className={`z-50 w-40 rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/10 overflow-hidden ${anchor === "bottom" ? "absolute right-0 top-full mt-1.5" : ""}`}
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Gerenciar</p>
          <ul className="p-1">
            <motion.li whileHover={{ x: 2 }} transition={{ duration: 0.1 }}>
              <button onClick={() => { onEdit(); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
                <Pencil size={13} className="shrink-0" /><span className="text-xs">Editar</span>
              </button>
            </motion.li>
            <motion.li whileHover={{ x: 2 }} transition={{ duration: 0.1 }}>
              <button onClick={() => { onDelete(); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                <Trash2 size={13} className="shrink-0" /><span className="text-xs">Excluir</span>
              </button>
            </motion.li>
          </ul>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── StatusDropdown ────────────────────────────────────────────────────────────

interface StatusDropdownProps {
  open: boolean; onClose: () => void; position: { x: number; y: number };
  currentStatus: Task["status"]; onSelect: (status: Task["status"]) => void;
  statusConfig?: Record<string, StatusConfig>;
}

const StatusDropdown = ({ open, position, currentStatus, onSelect, onClose, statusConfig }: StatusDropdownProps) => (
  <AnimatePresence>
    {open && (
      <>
        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); onClose(); }} />
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ position: "fixed", top: position.y, left: position.x }}
          className="z-50 w-44 rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/10 overflow-hidden"
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Alterar status</p>
          <ul className="p-1">
            {STATUS_ORDER.filter((s) => statusConfig ? !!statusConfig[s] : true).map((s) => {
              const isActive = currentStatus === s;
              const dot = statusConfig ? statusConfig[s]?.dot : STATUS_COLOR[s];
              const label = statusConfig ? statusConfig[s]?.label : STATUS_LABEL[s];
              return (
                <motion.li key={s} whileHover={{ x: 2 }} transition={{ duration: 0.1 }}>
                  <button onClick={() => onSelect(s)} className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${isActive ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                    <span className="flex-1 text-left text-xs">{label}</span>
                    {isActive && <Check size={12} className="text-foreground shrink-0" />}
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

export const TaskItem = ({ task, isLast, variant = "list", statusConfig, onEdit, onDelete, motionProps }: TaskItemProps) => {
  const { mutate: updateStatus, isPending } = useTaskStatus();
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusPos, setStatusPos] = useState({ x: 0, y: 0 });
  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  const temporal = useTemporalInfo(task);

  const handleStatusClick = useCallback((e: React.MouseEvent) => {
    if (isPending) return;
    setStatusPos({ x: e.clientX, y: e.clientY });
    setStatusOpen((prev) => !prev);
  }, [isPending]);

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
  // Calendar usa sua própria <ul> sem conflito, então motion.li é seguro aqui.
  if (variant === "calendar") {
    return (
      <>
        <MouseTooltip disabled={statusOpen}>
          <motion.li
            {...motionProps}
            onClick={handleStatusClick}
            onContextMenu={handleContextMenu}
            className={`group relative flex flex-col gap-1.5 p-2 rounded-lg border transition-all cursor-pointer select-none ${
              isCompleted ? "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900"
              : temporal.phase === "overdue" ? "bg-red-50/60 border-red-200 dark:bg-red-950/20 dark:border-red-900/60"
              : temporal.phase === "critical" ? "bg-orange-50/60 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/60"
              : "bg-background border-border hover:bg-muted/30"
            } ${!isLast ? "mb-2" : ""}`}
          >
            <div className="flex items-start gap-2">
              {isPending ? <Skeleton className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0" /> : <StatusIcon status={task.status} />}
              <div className="flex-1 min-w-0">
                {isPending ? <Skeleton className="h-3.5 w-36 rounded-md" /> : (
                  <p className={`text-xs font-medium leading-tight ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                )}
                {task.description && !isPending && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{task.description}</p>}
              </div>
              {isPending ? <Skeleton className="h-4 w-16 rounded-full shrink-0" /> : (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white shrink-0 ${STATUS_COLOR[task.status] ?? "bg-gray-400"}`}>
                  {STATUS_LABEL[task.status] ?? task.status}
                </span>
              )}
              <button onClick={openMobileContext} className="sm:hidden p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors shrink-0">
                <MoreHorizontal size={13} />
              </button>
            </div>
            {!isPending && temporal.phase !== "none" && !isCompleted && <TimeBadge info={temporal} mode="full" />}
            <div className="relative shrink-0">
              <StatusDropdown open={statusOpen} position={statusPos} currentStatus={task.status} onSelect={handleStatusChange} onClose={() => setStatusOpen(false)} />
              <div className="sm:hidden">
                <ContextMenu open={contextOpen} anchor="bottom" onEdit={handleEdit} onDelete={handleDelete} onClose={() => setContextOpen(false)} />
              </div>
            </div>
          </motion.li>
        </MouseTooltip>
        <div className="hidden sm:block">
          <ContextMenu open={contextOpen} position={contextPos} anchor="fixed" onEdit={handleEdit} onDelete={handleDelete} onClose={() => setContextOpen(false)} />
        </div>
      </>
    );
  }

  // ── Variant: list ──────────────────────────────────────────────────────────
  // motion.div (não li) para evitar aninhamento li>li com o AnimatePresence do pai.
  const status = statusConfig?.[task.status] ?? statusConfig?.pending;

  return (
    <>
      <MouseTooltip disabled={statusOpen}>
        <motion.div
          {...motionProps}
          onClick={handleStatusClick}
          onContextMenu={handleContextMenu}
          className={`group relative flex sm:grid sm:grid-cols-[1fr_auto_140px] gap-3 items-center px-5 py-3.5 transition-colors hover:bg-muted/30 cursor-pointer select-none
            ${!isLast ? "border-b border-border/60" : ""}
            ${isCompleted ? "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900" : ""}
          `}
        >
          <UrgencyBar phase={temporal.phase} />

          <div className="flex flex-col gap-1 min-w-0 flex-1 sm:contents">
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0">
                {isPending ? <Skeleton className="w-3.5 h-3.5 rounded-full" /> : status?.icon}
              </span>
              {isPending ? <Skeleton className="h-3.5 w-36 rounded-md" /> : (
                <span className={`text-sm font-medium truncate transition-all ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {!isPending && temporal.phase !== "none" && !isCompleted && <TimeBadge info={temporal} mode="compact" />}
              {isPending ? <Skeleton className="h-3.5 w-20 rounded-md" /> : (
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
                  <span className="text-xs text-muted-foreground font-medium">{status?.label}</span>
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto sm:ml-0 shrink-0 relative flex items-center gap-1">
            <button onClick={openMobileContext} className="sm:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
              <MoreHorizontal size={15} />
            </button>
            <div className="relative">
              <StatusDropdown open={statusOpen} position={statusPos} currentStatus={task.status} onSelect={handleStatusChange} statusConfig={statusConfig} onClose={() => setStatusOpen(false)} />
              <div className="sm:hidden">
                <ContextMenu open={contextOpen} anchor="bottom" onEdit={handleEdit} onDelete={handleDelete} onClose={() => setContextOpen(false)} />
              </div>
            </div>
          </div>
        </motion.div>
      </MouseTooltip>

      <div className="hidden sm:block">
        <ContextMenu open={contextOpen} position={contextPos} anchor="fixed" onEdit={handleEdit} onDelete={handleDelete} onClose={() => setContextOpen(false)} />
      </div>
    </>
  );
};