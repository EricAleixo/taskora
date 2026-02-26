"use client";

import { useEffect, useState } from "react";
import { MdClose, MdDeleteOutline, MdAccessTime, MdCalendarToday } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { useCreateTask } from "@/src/client/services/tasks/useCreateTask";
import { useUpdateTask } from "@/src/client/services/tasks/useUpdateTask";
import { useDeleteTask } from "@/src/client/services/tasks/useDeleteTask";
import { AnimatePresence, motion } from "framer-motion";
import { TimePicker } from "../../molecules/TimePicker/TimePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = "pending" | "in_progress" | "review" | "completed";

interface TaskFormValues {
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  status: TaskStatus;
  projectId: string;
}

interface TaskFormProps {
  projectId: string;
  mode?: "create" | "update";
  taskId?: string;
  initialValues?: Partial<Omit<TaskFormValues, "projectId">>;
  open?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  onSubmit?: (values: TaskFormValues) => void | Promise<void>;
  onDelete?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pendente", color: "bg-amber-500" },
  { value: "in_progress", label: "Em progresso", color: "bg-blue-500" },
  { value: "review", label: "Revisando", color: "bg-purple-500" },
  { value: "completed", label: "Concluída", color: "bg-emerald-500" },
];

const input =
  "w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all";

// ─── Animation Variants ───────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const, delay: 0.05 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
  },
};

const panelDesktopVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
  },
};

const deleteConfirmVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: "auto" as const,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

// ─── Hook: detect if viewport is ≥ sm (640px) ─────────────────────────────────

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// ─── TaskForm ─────────────────────────────────────────────────────────────────

export function TaskForm({
  projectId,
  mode = "create",
  taskId,
  initialValues,
  open: controlledOpen,
  onClose,
  children,
  onSubmit,
  onDelete,
}: TaskFormProps) {
  const isUpdate = mode === "update";
  const isControlled = controlledOpen !== undefined;
  const isDesktop = useIsDesktop();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;

  const [status, setStatus] = useState<TaskStatus>(initialValues?.status ?? "pending");
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? "");
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setStatus(initialValues?.status ?? "pending");
      setStartTime(initialValues?.startTime ?? "");
      setEndTime(initialValues?.endTime ?? "");
      setConfirmingDelete(false);
    }
  }, [open]);

  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask(projectId);
  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask(projectId);
  const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask(projectId);

  const isPending = isCreating || isUpdating || isDeleting;

  const close = () => {
    if (isPending) return;
    if (isControlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const values: TaskFormValues = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      date: fd.get("date") as string,
      startTime: startTime || null,
      endTime: endTime || null,
      status,
      projectId,
    };

    if (isUpdate && taskId !== undefined) {
      await updateTask({ id: taskId, payload: values });
    } else {
      await createTask(values);
    }

    onSubmit?.(values);
    close();
  };

  const handleDelete = async () => {
    if (!taskId) return;
    await deleteTask(taskId);
    onDelete?.();
    close();
  };

  const durationLabel = (() => {
    if (!startTime || !endTime || startTime >= endTime) return null;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60), m = diff % 60;
    return `Duração: ${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}min` : ""}`;
  })();

  const activePanelVariants = isDesktop ? panelDesktopVariants : panelVariants;

  return (
    <>
      {children && (
        <div onClick={() => setInternalOpen(true)} className="contents">
          {children}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              key="panel"
              variants={activePanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl"
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-border/60">
                <h2 className="font-semibold text-sm">
                  {isUpdate ? "Editar Tarefa" : "Nova Tarefa"}
                </h2>
                <div className="flex items-center gap-1">
                  {isUpdate && taskId !== undefined && (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete((v) => !v)}
                      disabled={isPending}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                        confirmingDelete
                          ? "text-destructive bg-destructive/10"
                          : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      }`}
                    >
                      <MdDeleteOutline className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={close}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                  >
                    <MdClose className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Delete confirm */}
                <AnimatePresence>
                  {confirmingDelete && (
                    <motion.div
                      key="delete-confirm"
                      variants={deleteConfirmVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3">
                        <p className="text-sm font-medium">Excluir esta tarefa?</p>
                        <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmingDelete(false)}
                            disabled={isPending}
                            className="flex-1 h-8 rounded-lg border border-input text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="flex-1 h-8 rounded-lg bg-destructive text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {isDeleting ? (
                              <span className="h-3 w-3 rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground animate-spin" />
                            ) : (
                              <MdDeleteOutline className="h-3.5 w-3.5" />
                            )}
                            {isDeleting ? "Excluindo..." : "Excluir"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="title" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Título
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    minLength={3}
                    autoFocus
                    defaultValue={initialValues?.title ?? ""}
                    placeholder="Ex: Revisar pull request"
                    className={input}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Descrição{" "}
                    <span className="normal-case font-normal opacity-50">(opcional)</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={2}
                    defaultValue={initialValues?.description ?? ""}
                    placeholder="Detalhes adicionais..."
                    className={`${input} resize-none`}
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          status === opt.value
                            ? "border-ring bg-muted text-foreground shadow-sm"
                            : "border-transparent text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${opt.color}`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label htmlFor="date" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <MdCalendarToday className="h-3.5 w-3.5" /> Data
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={initialValues?.date ?? TODAY}
                    className={input}
                  />
                </div>

                {/* ── Time range (drum pickers) ─────────────────────────── */}
                <div className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <MdAccessTime className="h-3.5 w-3.5" /> Horário{" "}
                    <span className="normal-case font-normal opacity-50">(opcional)</span>
                  </span>

                  <div className="flex items-end gap-3">
                    <TimePicker
                      label="Início"
                      value={startTime}
                      onChange={setStartTime}
                    />

                    <div className="pb-3 text-muted-foreground/30 shrink-0 text-lg font-mono">—</div>

                    <TimePicker
                      label="Fim"
                      value={endTime}
                      onChange={setEndTime}
                    />
                  </div>

                  <AnimatePresence>
                    {durationLabel && (
                      <motion.p
                        key="duration"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
                        exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
                        className="text-xs text-muted-foreground/50"
                      >
                        {durationLabel}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-border/60" />

                {/* Actions */}
                <div className="flex gap-2.5">
                  <Button type="button" variant="outline" className="flex-1 h-9 text-sm" onClick={close} disabled={isPending}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 h-9 text-sm font-medium" disabled={isPending}>
                    {isPending && !isDeleting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                        {isUpdate ? "Salvando..." : "Criando..."}
                      </span>
                    ) : isUpdate ? "Salvar Alterações" : "Criar Tarefa"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}