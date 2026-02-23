import { Task } from "@/app/types/Task";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical } from "lucide-react";
import { LuMoveVertical, LuEye, LuTrash2, LuCalendar, LuClock } from "react-icons/lu";
import { TaskStatusBadge } from "../../atoms/TaskStatusBadge/TaskStatusBadge";
import { formatDate } from "@/lib/formatDate";

// Mobile Card View
export const TaskCard = ({
  task,
  isSelected,
  onToggleSelect,
}: {
  task: Task;
  isSelected: boolean;
  onToggleSelect: () => void;
}) => (
  <div className="rounded-lg border bg-background p-4 shadow-sm">
    {/* Header do Card */}
    <div className="mb-3 flex items-start justify-between">
      <div className="flex flex-1 items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          className="mt-1"
        />
        <div className="flex-1">
          <h3 className="font-medium leading-snug">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-500">{task.description}</p>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <LuEye className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            <LuTrash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Status e Projeto */}
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <TaskStatusBadge status={task.status} />
      {task.project && (
        <span className="text-xs text-gray-500">{task.project.title}</span>
      )}
    </div>

    {/* Info adicional */}
    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
      <div className="flex items-center gap-1.5">
        <LuCalendar className="h-4 w-4 text-gray-400" />
        {formatDate(task.date)}
      </div>
      {task.startTime && task.endTime && (
        <div className="flex items-center gap-1.5">
          <LuClock className="h-4 w-4 text-gray-400" />
          {task.startTime} - {task.endTime}
        </div>
      )}
      {task.duration && (
        <div className="text-sm text-gray-500">{task.duration} min</div>
      )}
    </div>
  </div>
);