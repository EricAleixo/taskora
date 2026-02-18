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
import { MdAccessTime, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  date: string;
  duration?: number | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  createdAt: Date;
};

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-500" },
  in_progress: { label: "Em Progresso", color: "bg-blue-500" },
  completed: { label: "Concluída", color: "bg-green-500" },
  cancelled: { label: "Cancelada", color: "bg-red-500" },
};

export const CardTask = ({ task }: { task: Task }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusInfo = statusConfig[task.status];
  const formattedDate = format(new Date(task.date), "dd 'de' MMM", {
    locale: ptBR,
  });

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
            <span>{formattedDate}</span>
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
  const formattedDate = format(new Date(task.date), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription>Detalhes da tarefa</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Status */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Status
            </p>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>

          {/* Data */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Data
            </p>
            <div className="flex items-center gap-2">
              <MdCalendarToday className="text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Horários */}
          {(task.startTime || task.endTime) && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Horário
              </p>
              <div className="flex items-center gap-2">
                <MdAccessTime className="text-muted-foreground" />
                <span>
                  {task.startTime || "--:--"} até {task.endTime || "--:--"}
                </span>
              </div>
            </div>
          )}

          {/* Duração */}
          {task.duration && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Duração
              </p>
              <span>{task.duration} minutos</span>
            </div>
          )}

          {/* Descrição */}
          {task.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Descrição
              </p>
              <p className="text-sm leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Data de Criação */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Criada em{" "}
              {format(task.createdAt, "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};