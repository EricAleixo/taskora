"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MdAdd,
  MdClose,
  MdAccessTime,
  MdCalendarToday,
  MdNotes,
  MdTitle,
  MdEdit,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { useCreateTask } from "@/src/client/services/tasks/useCreateTask";

// ─── Types ───────────────────────────────────────────────────────────────────

type TaskStatus =
  | "pending"
  | "completed"
  | "in_progress"
  | "cancelled"
  | "review";

interface TaskFormValues {
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  status: TaskStatus;
  projectId: number;
}

interface TaskFormProps {
  projectId: number;
  variant?: "primary" | "ghost";
  // ── Mode ──────────────────────────────────────────────────────
  mode?: "create" | "update";
  /** Valores iniciais (necessário quando mode="update") */
  initialValues?: Partial<Omit<TaskFormValues, "projectId">>;
  /** Disparado no submit — no modo update é apenas um console.log por enquanto */
  onSubmit?: (values: TaskFormValues) => void | Promise<void>;
  defaultOpen?: boolean; // ← adicione isso
  onClose?: () => void;
}

// ─── Trigger variants ────────────────────────────────────────────────────────

const TriggerPrimary = ({
  onClick,
  mode,
}: {
  onClick: () => void;
  mode: "create" | "update";
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 whitespace-nowrap bg-primary rounded-lg px-3 py-2 text-primary-foreground text-sm font-medium transition-all duration-150 hover:bg-primary/90 active:scale-95"
  >
    {mode === "create" ? (
      <>
        <MdAdd className="h-4 w-4" />
        <span className="hidden sm:inline">Adicionar Tarefa</span>
        <span className="sm:hidden">Nova</span>
      </>
    ) : (
      <>
        <MdEdit className="h-4 w-4" />
        <span className="hidden sm:inline">Editar Tarefa</span>
        <span className="sm:hidden">Editar</span>
      </>
    )}
  </button>
);

const TriggerGhost = ({
  onClick,
  mode,
}: {
  onClick: () => void;
  mode: "create" | "update";
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
  >
    {mode === "create" ? (
      <>
        <MdAdd className="h-4 w-4" />
        Adicionar tarefa
      </>
    ) : (
      <>
        <MdEdit className="h-4 w-4" />
        Editar tarefa
      </>
    )}
  </button>
);

// ─── Field components ─────────────────────────────────────────────────────────

const FieldLabel = ({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) => (
  <label
    htmlFor={htmlFor}
    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"
  >
    {children}
    {optional && (
      <span className="text-muted-foreground/50 normal-case tracking-normal font-normal">
        (opcional)
      </span>
    )}
  </label>
);

const inputClass =
  "w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all duration-150";

// ─── Status selector ──────────────────────────────────────────────────────────

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pendente", color: "bg-amber-500" },
  { value: "in_progress", label: "Em progresso", color: "bg-blue-500" },
  { value: "review", label: "Revisando", color: "bg-purple-500" },
  { value: "completed", label: "Concluída", color: "bg-emerald-500" },
];

const StatusSelector = ({
  value,
  onChange,
}: {
  value: TaskStatus;
  onChange: (v: TaskStatus) => void;
}) => (
  <div className="flex gap-2">
    {statusOptions.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 ${
          value === opt.value
            ? "border-ring bg-muted text-foreground shadow-sm"
            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${opt.color}`} />
        {opt.label}
      </button>
    ))}
  </div>
);

// ─── Drum Roll Wheel ──────────────────────────────────────────────────────────

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

interface WheelColumnProps {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}

const WheelColumn = ({ items, value, onChange }: WheelColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const currentIndex = items.indexOf(value);

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: smooth ? "smooth" : "instant",
    });
  }, []);

  useEffect(() => {
    scrollToIndex(currentIndex, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el || isScrolling.current) return;

    clearTimeout((handleScroll as any)._timer);
    (handleScroll as any)._timer = setTimeout(() => {
      const rawIndex = el.scrollTop / ITEM_HEIGHT;
      const snapped = Math.round(rawIndex);
      const clamped = Math.max(0, Math.min(snapped, items.length - 1));

      isScrolling.current = true;
      scrollToIndex(clamped);
      onChange(items[clamped]);
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    }, 80);
  }, [items, onChange, scrollToIndex]);

  return (
    <div className="relative flex-1 select-none">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-15 z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--popover) 0%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-15 z-10"
        style={{
          background:
            "linear-gradient(to top, var(--popover) 0%, transparent 100%)",
        }}
      />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="overflow-y-scroll scrollbar-hide"
        style={{
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          paddingTop: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
          paddingBottom: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            onClick={() => {
              scrollToIndex(items.indexOf(item));
              onChange(item);
            }}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
            className={`flex items-center justify-center cursor-pointer font-mono text-base font-medium transition-all duration-150 ${
              item === value
                ? "text-foreground scale-105"
                : "text-muted-foreground/40 scale-95"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Time Picker ──────────────────────────────────────────────────────────────

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  name: string;
}

const TimePicker = ({ label, value, onChange, name }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [hh, mm] = value ? value.split(":") : ["08", "00"];

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node))
      setOpen(false);
  }, []);

  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  return (
    <div className="relative flex-1" ref={popoverRef}>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center justify-between gap-2 w-full rounded-lg border px-3 py-2 text-sm font-mono font-medium transition-all duration-150 ${
            open
              ? "border-ring bg-background ring-2 ring-ring"
              : "border-input bg-muted/30 hover:bg-muted/50"
          } ${value ? "text-foreground" : "text-muted-foreground/50"}`}
        >
          {value ? `${hh}:${mm}` : "--:--"}
          <MdAccessTime
            className={`h-4 w-4 shrink-0 transition-colors ${open ? "text-primary" : "text-muted-foreground/50"}`}
          />
        </button>
      </div>
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 w-44 rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center gap-1 px-4 pt-3 pb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="relative flex px-3">
            <div
              className="pointer-events-none absolute left-3 right-3 rounded-lg bg-muted/70 border border-border/50 z-20"
              style={{
                top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                height: ITEM_HEIGHT,
              }}
            />
            <WheelColumn
              items={hours}
              value={hh}
              onChange={(h) => onChange(`${h}:${mm}`)}
            />
            <div
              className="flex items-center justify-center shrink-0 font-bold text-muted-foreground/60 z-30 pointer-events-none"
              style={{
                width: 16,
                marginTop: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) - 2,
                height: ITEM_HEIGHT,
              }}
            >
              :
            </div>
            <WheelColumn
              items={minutes}
              value={mm}
              onChange={(m) => onChange(`${hh}:${m}`)}
            />
          </div>
          <div className="px-3 pb-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (!value) onChange(`${hh}:${mm}`);
                setOpen(false);
              }}
              className="w-full rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Time Range ───────────────────────────────────────────────────────────────

const TimeRangeInput = ({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: {
  startTime: string;
  endTime: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) => (
  <div className="flex items-end gap-3">
    <TimePicker
      label="Início"
      value={startTime}
      onChange={onStartChange}
      name="startTime"
    />
    <div className="flex items-center pb-2.5 text-muted-foreground/30 shrink-0">
      <div className="h-px w-4 bg-current" />
    </div>
    <TimePicker
      label="Fim"
      value={endTime}
      onChange={onEndChange}
      name="endTime"
    />
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

const DEFAULT_STATUS: TaskStatus = "pending";

// ─── TaskForm ─────────────────────────────────────────────────────────────────

export const TaskForm = ({
  projectId,
  variant = "primary",
  mode = "create",
  initialValues,
  onSubmit,
  defaultOpen,
  onClose,
}: TaskFormProps) => {
  const isUpdate = mode === "update";

  const [open, setOpen] = useState(defaultOpen ?? false);

  // Controlled state (inicializado a partir de initialValues)
  const [status, setStatus] = useState<TaskStatus>(
    initialValues?.status ?? DEFAULT_STATUS,
  );
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? "");
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? "");

  // Só usado no modo create
  const { mutateAsync, isPending } = useCreateTask(projectId);

  // ── Handlers ────────────────────────────────────────────────

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    // Restaura ao estado inicial ao fechar
    setStatus(initialValues?.status ?? DEFAULT_STATUS);
    setStartTime(initialValues?.startTime ?? "");
    setEndTime(initialValues?.endTime ?? "");
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const values: TaskFormValues = {
      title: data.get("title") as string,
      description: (data.get("description") as string) || null,
      date: data.get("date") as string,
      startTime: startTime || null,
      endTime: endTime || null,
      status,
      projectId,
    };

    if (isUpdate) {
      // ── Atualizar: por enquanto apenas loga ──────────────────
      console.log("[TaskForm] update payload:", values);
      onSubmit?.(values);
      handleClose();
      return;
    }

    // ── Criar ────────────────────────────────────────────────
    await mutateAsync(values);
    onSubmit?.(values);
    handleClose();
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <>
      {/* Trigger */}
      {variant === "primary" ? (
        <TriggerPrimary onClick={handleOpen} mode={mode} />
      ) : (
        <TriggerGhost onClick={handleOpen} mode={mode} />
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="relative w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl overflow-hidden">
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 sm:pt-5 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  {isUpdate ? (
                    <MdEdit className="h-4 w-4 text-primary" />
                  ) : (
                    <MdAdd className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-foreground leading-tight">
                    {isUpdate ? "Editar Tarefa" : "Nova Tarefa"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isUpdate
                      ? "Atualize os detalhes abaixo"
                      : "Preencha os detalhes abaixo"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <MdClose className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="px-5 py-5 space-y-5 max-h-[80vh] overflow-y-auto"
            >
              {/* Title */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="title">
                  <MdTitle className="h-3.5 w-3.5" />
                  Título
                </FieldLabel>
                <input
                  id="title"
                  name="title"
                  required
                  minLength={3}
                  autoFocus
                  defaultValue={initialValues?.title ?? ""}
                  placeholder="Ex: Revisar pull request"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="description" optional>
                  <MdNotes className="h-3.5 w-3.5" />
                  Descrição
                </FieldLabel>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  defaultValue={initialValues?.description ?? ""}
                  placeholder="Detalhes adicionais..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <StatusSelector value={status} onChange={setStatus} />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="date">
                  <MdCalendarToday className="h-3.5 w-3.5" />
                  Data
                </FieldLabel>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={initialValues?.date ?? TODAY}
                  className={inputClass}
                />
              </div>

              {/* Time range */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="startTime" optional>
                  <MdAccessTime className="h-3.5 w-3.5" />
                  Horário
                </FieldLabel>
                <TimeRangeInput
                  startTime={startTime}
                  endTime={endTime}
                  onStartChange={setStartTime}
                  onEndChange={setEndTime}
                />
                {startTime && endTime && startTime < endTime && (
                  <p className="text-xs text-muted-foreground/50">
                    {(() => {
                      const [sh, sm] = startTime.split(":").map(Number);
                      const [eh, em] = endTime.split(":").map(Number);
                      const diff = eh * 60 + em - (sh * 60 + sm);
                      if (diff <= 0) return null;
                      const h = Math.floor(diff / 60);
                      const m = diff % 60;
                      return `Duração: ${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}min` : ""}`;
                    })()}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border/60" />

              {/* Actions */}
              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-9 text-sm font-medium"
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      {isUpdate ? "Salvando..." : "Criando..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      {isUpdate ? (
                        <>
                          <MdEdit className="h-4 w-4" />
                          Salvar Alterações
                        </>
                      ) : (
                        <>
                          <MdAdd className="h-4 w-4" />
                          Criar Tarefa
                        </>
                      )}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
