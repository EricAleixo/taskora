import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { parseLocalDate } from "@/lib/formatDate";
import { TaskItem } from "../../atoms/TaskItem/TaskItem";
import { Task } from "@/app/types/Task";

interface CalendarTabProps {
  project: any;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const statusColor: Record<string, string> = {
  pending: "bg-gray-400",
  in_progress: "bg-yellow-400",
  review: "bg-purple-400",
  completed: "bg-green-500",
};

// Returns Tailwind classes for heatmap coloring based on completion ratio
const getDayHeatmap = (tasks: any[]) => {
  if (tasks.length === 0) return { bg: "", border: "border-border", text: "" };

  const completed = tasks.filter((t) => t.status === "completed").length;
  const ratio = completed / tasks.length;

  if (ratio === 1)
    return {
      bg: "bg-green-100 dark:bg-green-950/40",
      border: "border-green-400",
      text: "text-green-700",
    };
  if (ratio >= 0.66)
    return {
      bg: "bg-lime-100 dark:bg-lime-950/40",
      border: "border-lime-400",
      text: "text-lime-700",
    };
  if (ratio >= 0.33)
    return {
      bg: "bg-amber-100 dark:bg-amber-950/40",
      border: "border-amber-400",
      text: "text-amber-700",
    };
  if (ratio > 0)
    return {
      bg: "bg-orange-100 dark:bg-orange-950/40",
      border: "border-orange-400",
      text: "text-orange-700",
    };
  return {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-300",
    text: "text-rose-600",
  };
};

export const CalendarTab = ({ project }: CalendarTabProps) => {
  const today = new Date();
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  // Armazena apenas o dia selecionado — as tasks são derivadas do project
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const tasks = (project.tasks ?? []).filter((t: any) => t.date);

  const getTasksForDay = (
    day: number,
    month = current.month,
    year = current.year,
  ) => {
    return tasks.filter((t: any) => {
      const d = parseLocalDate(t.date);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  // Tasks do painel derivadas em tempo real do project.tasks
  const selectedTasks: Task[] = useMemo(
    () => (selectedDay ? getTasksForDay(selectedDay) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDay, project.tasks, current.month, current.year],
  );

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const prev = () => {
    setSelectedDay(null);
    setCurrent((c) =>
      c.month === 0
        ? { month: 11, year: c.year - 1 }
        : { month: c.month - 1, year: c.year },
    );
  };
  const next = () => {
    setSelectedDay(null);
    setCurrent((c) =>
      c.month === 11
        ? { month: 0, year: c.year + 1 }
        : { month: c.month + 1, year: c.year },
    );
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDayClick = (day: number) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length === 0) return;
    setSelectedDay((prev) => (prev === day ? null : day));
  };

  const completedCount = selectedTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const pendingCount = selectedTasks.length - completedCount;

  return (
    <div
      className="rounded-xl min-h-[calc(100vh-300px)] p-[1px]"
      style={{
        background:
          "linear-gradient(to right, transparent, rgb(36, 161, 54), transparent)",
      }}
    >
      <div className="bg-card rounded-xl shadow min-h-[calc(100vh-300px)] p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {MONTHS[current.month]} {current.year}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={prev}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <button
              onClick={next}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            const isToday =
              day === today.getDate() &&
              current.month === today.getMonth() &&
              current.year === today.getFullYear();

            const isSelected = selectedDay === day;
            const dayTasks = day ? getTasksForDay(day) : [];
            const heatmap = getDayHeatmap(dayTasks);
            const hasTasks = dayTasks.length > 0;

            return (
              <div
                key={idx}
                onClick={() => day && handleDayClick(day)}
                className={`min-h-18 rounded-lg p-1.5 border text-sm transition-all duration-200 ${
                  day
                    ? hasTasks
                      ? `${heatmap.bg} ${isSelected ? "ring-2 ring-primary ring-offset-1" : heatmap.border} cursor-pointer hover:brightness-95`
                      : "border-border hover:bg-muted/40 cursor-default"
                    : "border-transparent"
                }`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : hasTasks
                            ? `${heatmap.text} font-semibold`
                            : "text-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 2).map((t: any) => (
                        <div
                          key={t.id}
                          className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${statusColor[t.status] ?? "bg-gray-400"}`}
                          title={t.title}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div
                          className={`text-[10px] pl-0.5 font-medium ${heatmap.text || "text-muted-foreground"}`}
                        >
                          +{dayTasks.length - 2} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Day detail panel */}
        {selectedDay && selectedTasks.length > 0 && (
          <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {selectedDay} de {MONTHS[current.month]}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span className="text-green-600 font-medium">
                    {completedCount} concluída{completedCount !== 1 ? "s" : ""}
                  </span>
                  {pendingCount > 0 && (
                    <>
                      {" · "}
                      <span className="text-rose-500 font-medium">
                        {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / selectedTasks.length) * 100}%`,
                }}
              />
            </div>

            {/* Task list */}
            <div className="space-y-2">
              {[...selectedTasks]
                .sort((a, b) =>
                  a.status === "completed"
                    ? -1
                    : b.status === "completed"
                      ? 1
                      : 0,
                )
                .map((t: any, idx, arr) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    isLast={idx === arr.length - 1}
                    variant="calendar"
                  />
                ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 pt-2 flex-wrap">
          {[
            { label: "Tudo feito", color: "bg-green-400" },
            { label: "Maioria feita", color: "bg-lime-400" },
            { label: "Metade feita", color: "bg-amber-400" },
            { label: "Pouco feito", color: "bg-orange-400" },
            { label: "Nada feito", color: "bg-rose-300" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
