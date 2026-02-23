import { Task } from "@/app/types/Task";
import { TaskCard } from "../Cards/TaskCard";

// Mobile Cards List
export const TasksCards = ({
  tasks,
  selectedTasks,
  onToggleTask,
}: {
  tasks: Task[];
  selectedTasks: number[];
  onToggleTask: (id: number) => void;
}) => (
  <div className="space-y-3 md:hidden">
    {tasks.length === 0 ? (
      <div className="rounded-lg border bg-card p-8 text-center text-gray-500">
        Nenhuma tarefa encontrada
      </div>
    ) : (
      tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isSelected={selectedTasks.includes(task.id)}
          onToggleSelect={() => onToggleTask(task.id)}
        />
      ))
    )}
  </div>
);