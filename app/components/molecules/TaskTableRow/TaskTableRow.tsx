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
  <TableRow className="bg-background hover:bg-background/95">
    <TableCell>
      <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
    </TableCell>
    <TableCell>
      <div className="max-w-md">
        <div className="font-medium text-foreground">{task.title}</div>
        {task.description && (
          <div className="mt-1 text-sm text-muted-foreground">{task.description}</div>
        )}
      </div>
    </TableCell>
    <TableCell className="text-sm text-muted-foreground">
      {task?.project?.title || "—"}
    </TableCell>
    <TableCell>
      <TaskStatusBadge status={task.status} />
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2 text-sm text-foreground">
        <LuCalendar className="h-4 w-4 text-muted-foreground" />
        {formatDate(task.date)}
      </div>
    </TableCell>
    <TableCell>
      {task.startTime && task.endTime ? (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <LuClock className="h-4 w-4 text-muted-foreground" />
          {task.startTime} - {task.endTime}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </TableCell>
    <TableCell className="text-sm">
      {task.duration ? (
        <span className="text-foreground">{task.duration} min</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </TableCell>
    <TableCell>
      <TaskActionsMenu task={task}/>
    </TableCell>
  </TableRow>
);