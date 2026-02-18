import { Task } from "@/app/types/Task";
import { Badge } from "@/components/ui/badge";

type TaskStatus = Task["status"];

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "Em Progresso", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Concluída", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelada", color: "bg-gray-100 text-gray-800" },
};

// Task Status Badge
export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => (
  <Badge variant="secondary" className={statusConfig[status].color}>
    {statusConfig[status].label}
  </Badge>
);