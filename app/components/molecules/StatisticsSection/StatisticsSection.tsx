import { Task } from "@/app/types/Task";
import { StatCard } from "../../atoms/StatCard/StatCard";

// Statistics Section
export const StatisticsSection = ({ tasks }: { tasks: Task[] }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
    <StatCard value={tasks.length} label="Total" />
    <StatCard
      value={tasks.filter((t) => t.status === "pending").length}
      label="Pendentes"
      color="text-yellow-600"
    />
    <StatCard
      value={tasks.filter((t) => t.status === "in_progress").length}
      label="Em Progresso"
      color="text-blue-600"
    />
    <StatCard
      value={tasks.filter((t) => t.status === "completed").length}
      label="Concluídas"
      color="text-green-600"
    />
  </div>
);