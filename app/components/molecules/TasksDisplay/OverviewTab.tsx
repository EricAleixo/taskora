import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";

interface OverviewTabProps {
  project: any;
}

export const OverviewTab = ({ project }: OverviewTabProps) => {
  const tasks = project.tasks ?? [];
  const total = tasks.length;
  const done = tasks.filter((t: any) => t.status === "completed").length;
  const inProgress = tasks.filter(
    (t: any) => t.status === "in_progress",
  ).length;
  const pending = tasks.filter((t: any) => t.status === "pending").length;
  const review = tasks.filter((t: any) => t.status === "review").length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = [
    {
      label: "Total de Tarefas",
      value: total,
      icon: <TrendingUp size={18} />,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20",
    },
    {
      label: "Concluídas",
      value: done,
      icon: <CheckCircle2 size={18} />,
      color: "text-green-500 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20",
    },
    {
      label: "Em Andamento",
      value: inProgress,
      icon: <Clock size={18} />,
      color: "text-yellow-500 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20",
    },
    {
      label: "Pendentes",
      value: pending,
      icon: <AlertCircle size={18} />,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20",
    },
  ];

  return (
    <div
      className="relative rounded-xl min-h-[calc(100vh-800px)] p-px"
      style={{
        background:
          "linear-gradient(to right, transparent, rgb(36, 161, 54), transparent)",
      }}
    >
      <div className="bg-card p-6 rounded-xl shadow min-h-full space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {project.name ?? "Projeto"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {project.description ?? "Visão geral do projeto"}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Progresso geral</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl p-4 ${stat.bg} flex flex-col gap-2`}
            >
              <div className={`${stat.color}`}>{stat.icon}</div>
              <span className="text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Recent tasks */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Tarefas Recentes
          </h3>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border"
              >
                <span className="text-sm text-foreground truncate max-w-[70%]">
                  {task.title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : task.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        : task.status === "review"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                >
                  {task.status === "completed"
                    ? "Finalizada"
                    : task.status === "in_progress"
                      ? "Para Fazer"
                      : task.status === "review"
                        ? "Revisando"
                        : "Para Fazer"}
                </span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma tarefa encontrada.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
