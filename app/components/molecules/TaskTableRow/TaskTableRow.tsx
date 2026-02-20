import { Task } from "@/app/types/Task";
import { TableRow, TableCell } from "@/components/ui/table";
import { LuCalendar, LuClock } from "react-icons/lu";
import { TaskActionsMenu } from "../../atoms/TaskActionsMenu/TaskActionsMenu";
import { TaskStatusBadge } from "../../atoms/TaskStatusBadge/TaskStatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/formatDate";

// Desktop Table Row
export const TaskTableRow = ({
  task,
  isSelected,
  onToggleSelect,
}: {
  task: Task;
  isSelected: boolean;
  onToggleSelect: () => void;
}) => (
  <TableRow>
    <TableCell>
      <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
    </TableCell>
    <TableCell>
      <div className="max-w-md">
        <div className="font-medium">{task.title}</div>
        {task.description && (
          <div className="mt-1 text-sm text-gray-500">{task.description}</div>
        )}
      </div>
    </TableCell>
    <TableCell className="text-sm text-gray-500">
      {task.project.title || "—"}
    </TableCell>
    <TableCell>
      <TaskStatusBadge status={task.status} />
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2 text-sm">
        <LuCalendar className="h-4 w-4 text-gray-400" />
        {formatDate(task.date)}
      </div>
    </TableCell>
    <TableCell>
      {task.startTime && task.endTime ? (
        <div className="flex items-center gap-2 text-sm">
          <LuClock className="h-4 w-4 text-gray-400" />
          {task.startTime} - {task.endTime}
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </TableCell>
    <TableCell className="text-sm">
      {task.duration ? (
        <span className="text-gray-600">{task.duration} min</span>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </TableCell>
    <TableCell>
      <TaskActionsMenu />
    </TableCell>
  </TableRow>
);