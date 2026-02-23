"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock,
  Timer,
  FolderOpen,
  AlignLeft,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  date: string;
  duration?: number | null;
  status: "pending" | "in_progress" | "completed";
  project?: { id: number; title: string; description?: string | null; [key: string]: any } | string | null;
  projectId?: number | null;
  createdAt?: string | Date;
};

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Circle,
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  in_progress: {
    label: "Em andamento",
    icon: Loader2,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Concluída",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

type Props = {
  task: Task;
  open: boolean;
  onClose: () => void;
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
};

export const ViewTaskModal = ({ task, open, onClose }: Props) => {
  const status = statusConfig[task.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-snug">
            {task.title}
          </DialogTitle>
          <div className="pt-1">
            <Badge
              variant="outline"
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.className}`}
            >
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col gap-4">
          {task.description && (
            <InfoRow
              icon={AlignLeft}
              label="Descrição"
              value={
                <span className="leading-relaxed text-foreground/80">
                  {task.description}
                </span>
              }
            />
          )}

          <InfoRow
            icon={CalendarDays}
            label="Data"
            value={formatDate(task.date)}
          />

          {(task.startTime || task.endTime) && (
            <InfoRow
              icon={Clock}
              label="Horário"
              value={
                task.startTime && task.endTime
                  ? `${task.startTime} — ${task.endTime}`
                  : task.startTime ?? task.endTime
              }
            />
          )}

          {task.duration != null && (
            <InfoRow
              icon={Timer}
              label="Duração"
              value={formatDuration(task.duration)}
            />
          )}

          {task.project && (
            <InfoRow
              icon={FolderOpen}
              label="Projeto"
              value={
                typeof task.project === "object"
                  ? task.project.title
                  : task.project
              }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};