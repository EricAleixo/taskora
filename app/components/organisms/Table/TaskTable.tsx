import { Task } from "@/app/types/Task";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { TaskTableRow } from "../../molecules/TaskTableRow/TaskTableRow";
import { Checkbox } from "@/components/ui/checkbox";

export const TasksTable = ({
  tasks,
  selectedTasks,
  onToggleTask,
  onToggleAll,
}: {
  tasks: Task[];
  selectedTasks: number[];
  onToggleTask: (id: number) => void;
  onToggleAll: () => void;
}) => (
  <div className="hidden overflow-hidden rounded-lg border bg-card shadow-sm md:block">
    <Table>
      <TableHeader className="bg-card">
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={
                tasks.length > 0 && selectedTasks.length === tasks.length
              }
              onCheckedChange={onToggleAll}
            />
          </TableHead>
          <TableHead>Tarefa</TableHead>
          <TableHead>Projeto</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead>Duração</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-32 text-center">
              Nenhuma tarefa encontrada
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task) => (
            <TaskTableRow
              key={task.id}
              task={task}
              isSelected={selectedTasks.includes(task.id)}
              onToggleSelect={() => onToggleTask(task.id)}
            />
          ))
        )}
      </TableBody>
    </Table>
  </div>
);