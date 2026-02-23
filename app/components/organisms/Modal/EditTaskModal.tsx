"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTask } from "@/src/client/services/tasks/useUpdateTask";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  date: string;
  duration?: number | null;
  status: "pending" | "in_progress" | "completed";
  project?: string | null;
  projectId?: number | null;
};

type FormValues = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: "pending" | "in_progress" | "completed";
};

type Props = {
  task: Task;
  projectId: number;
  open: boolean;
  onClose: () => void;
};

export const EditTaskModal = ({ task, projectId, open, onClose }: Props) => {
  const { mutate: updateTask, isPending } = useUpdateTask(projectId);

  const { register, handleSubmit, control, reset, formState: { errors } } =
    useForm<FormValues>({
      defaultValues: {
        title: task.title,
        description: task.description ?? "",
        date: task.date,
        startTime: task.startTime ?? "",
        endTime: task.endTime ?? "",
        duration: task.duration?.toString() ?? "",
        status: task.status,
      },
    });

  useEffect(() => {
    if (open) {
      reset({
        title: task.title,
        description: task.description ?? "",
        date: task.date,
        startTime: task.startTime ?? "",
        endTime: task.endTime ?? "",
        duration: task.duration?.toString() ?? "",
        status: task.status,
      });
    }
  }, [open, task, reset]);

  const onSubmit = (values: FormValues) => {
    updateTask(
      {
        id: task.id,
        payload: {
          title: values.title,
          description: values.description || undefined,
          date: values.date,
          startTime: values.startTime || undefined,
          endTime: values.endTime || undefined,
          duration: values.duration ? Number(values.duration) : undefined,
          status: values.status,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              {...register("title", { required: "Título é obrigatório" })}
              placeholder="Nome da tarefa"
            />
            {errors.title && (
              <span className="text-xs text-red-500">{errors.title.message}</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva a tarefa..."
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data <span className="text-red-500">*</span></Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startTime">Início</Label>
              <Input id="startTime" type="time" {...register("startTime")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endTime">Fim</Label>
              <Input id="endTime" type="time" {...register("endTime")} />
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              {...register("duration")}
              placeholder="Ex: 90"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};