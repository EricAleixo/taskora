"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "@/src/client/services/tasks/useDeleteTask";
import { LuTriangleAlert } from "react-icons/lu";

type Props = {
  task: { id: string; title: string };
  projectId: string | undefined;
  open: boolean;
  onClose: () => void;
};

export const DeleteTaskModal = ({ task, projectId, open, onClose }: Props) => {
  const { mutate: deleteTask, isPending } = useDeleteTask(projectId);

  const handleDelete = () => {
    deleteTask(task.id, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <LuTriangleAlert className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle>Excluir tarefa</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">"{task.title}"</span>?
            Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};