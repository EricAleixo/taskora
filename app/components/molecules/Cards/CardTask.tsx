"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { MdAccessTime, MdCalendarToday, MdNotes } from "react-icons/md";
import { formatDate, formatDateShort, formatDateLong, formatDateTime } from "@/lib/formatDate";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  date: string;
  duration?: number | null;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "review";
  createdAt: Date;
};

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-500" },
  in_progress: { label: "Em Progresso", color: "bg-blue-500" },
  review: { label: "Em revisão", color: "bg-purple-500" },
  completed: { label: "Concluída", color: "bg-green-500" },
  cancelled: { label: "Cancelada", color: "bg-red-500" },
};

export const CardTask = ({ task }: { task: Task }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusInfo = statusConfig[task.status];

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-2">
              {task.title}
            </h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MdCalendarToday className="text-base" />
            <span>{formatDate(task.date)}</span>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </CardContent>
      </Card>

      <TaskDetailsModal
        task={task}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

const TaskDetailsModal = ({
  task,
  isOpen,
  onClose,
}: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const statusInfo = statusConfig[task.status];

  const computedDuration = (() => {
    if (!task.startTime || !task.endTime) return task.duration ?? null;
    const [sh, sm] = task.startTime.split(":").map(Number);
    const [eh, em] = task.endTime.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    return diff > 0 ? diff : (task.duration ?? null);
  })();

  const durationLabel = computedDuration
    ? (() => {
        const h = Math.floor(computedDuration / 60);
        const m = computedDuration % 60;
        return [h > 0 && `${h}h`, m > 0 && `${m}min`].filter(Boolean).join(" ");
      })()
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="relative px-6 pt-6 pb-5 border-b border-border/60">
          <div className="absolute top-5 right-11">
            <Badge className={`${statusInfo.color} text-xs font-medium`}>
              {statusInfo.label}
            </Badge>
          </div>

          <DialogHeader className="space-y-1 pr-8">
            <DialogTitle className="text-base font-semibold leading-snug text-foreground">
              {task.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Criada em {formatDateTime(task.createdAt)}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-0 divide-y divide-border/50">

          {/* Date */}
          <InfoRow icon={<MdCalendarToday className="h-4 w-4" />} label="Data">
            <span className="text-sm text-foreground">{formatDateLong(task.date)}</span>
          </InfoRow>

          {/* Time + duration */}
          {(task.startTime || task.endTime) && (
            <InfoRow icon={<MdAccessTime className="h-4 w-4" />} label="Horário">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-foreground">
                  {task.startTime ?? "--:--"}
                  <span className="mx-1.5 text-muted-foreground/50">→</span>
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

          {/* Duration standalone (when no times) */}
          {!task.startTime && !task.endTime && task.duration && (
            <InfoRow icon={<MdAccessTime className="h-4 w-4" />} label="Duração">
              <span className="text-sm text-foreground">{durationLabel}</span>
            </InfoRow>
          )}

          {/* Description */}
          {task.description && (
            <InfoRow icon={<MdNotes className="h-4 w-4" />} label="Descrição">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </InfoRow>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-3 py-3.5">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
      {icon}
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
        {label}
      </span>
      <div>{children}</div>
    </div>
  </div>
);