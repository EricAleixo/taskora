"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical } from "lucide-react";
import { LuEye, LuTrash2 } from "react-icons/lu";
import { useState } from "react";
import { DeleteTaskModal } from "../../organisms/Modal/DeleteTaskModal";
import { EditTaskModal } from "../../organisms/Modal/EditTaskModal";
import { ViewTaskModal } from "../../organisms/Modal/TaskModal";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  date: string;
  duration?: number | null;
  status: "pending" | "in_progress" | "completed";
  project?: string | null;
  projectId?: string | null;
  createdAt?: string | Date;
};

type Props = {
  task: Task;
  projectId?: string;
};

type ModalType = "view" | "edit" | "delete" | null;

export const TaskActionsMenu = ({ task, projectId }: Props) => {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setModal("view")}>
            <LuEye className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setModal("edit")}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={() => setModal("delete")}
          >
            <LuTrash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewTaskModal
        task={task}
        open={modal === "view"}
        onClose={() => setModal(null)}
      />

      <EditTaskModal
        task={task}
        projectId={projectId}
        open={modal === "edit"}
        onClose={() => setModal(null)}
      />

      <DeleteTaskModal
        task={task}
        projectId={projectId}
        open={modal === "delete"}
        onClose={() => setModal(null)}
      />
    </>
  );
};