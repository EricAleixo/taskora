"use client";
import { Project } from "@/app/types/Project";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  List,
  Columns2,
  Calendar,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BoardTab } from "../../molecules/TasksDisplay/BoardTab";
import { CalendarTab } from "../../molecules/TasksDisplay/CalendarTab";
import { ListTab } from "../../molecules/TasksDisplay/ListTab";
import { OverviewTab } from "../../molecules/TasksDisplay/OverviewTab";

interface TaskBoardProps {
  initialProject: Project;
}

const tabs = [
  { label: "Geral", icon: <LayoutDashboard size={15} /> },
  { label: "Lista", icon: <List size={15} /> },
  { label: "Quadro", icon: <Columns2 size={15} /> },
  { label: "Calendário", icon: <Calendar size={15} /> },
] as const;

type TabLabel = (typeof tabs)[number]["label"];

export type FilterStatus =
  | "all"
  | "pending"
  | "in_progress"
  | "review"
  | "completed";

const STATUS_OPTIONS: { value: FilterStatus; label: string; dot: string }[] = [
  { value: "all", label: "Todas", dot: "bg-gray-400" },
  { value: "pending", label: "Para Fazer", dot: "bg-amber-400" },
  { value: "in_progress", label: "Em Andamento", dot: "bg-blue-400" },
  { value: "review", label: "Revisando", dot: "bg-purple-400" },
  { value: "completed", label: "Finalizada", dot: "bg-green-400" },
];

export const TaskBoard = ({ initialProject }: TaskBoardProps) => {
  const [activeTab, setActiveTab] = useState<TabLabel>("Geral");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Aplica o filtro nas tasks do projeto
  const filteredProject =
    filterStatus === "all"
      ? initialProject
      : {
          ...initialProject,
          tasks: (initialProject.tasks ?? []).filter(
            (t: any) => t.status === filterStatus,
          ),
        };

  const isFiltered = filterStatus !== "all";

  return (
    <>
      {/* Navbar */}
      <div className="flex items-center gap-1 mb-3 border-b border-gray-200 dark:border-gray-700 px-1">
        {/* Tabs com scroll lateral */}
        <div className="flex-1 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-1 w-max">
            {tabs.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t transition-colors relative whitespace-nowrap",
                  activeTab === item.label
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter button — fixo, fora do scroll */}
        <div className="relative pb-px shrink-0" ref={filterRef}>
          {/* ... resto do botão de filtro inalterado ... */}
        </div>
      </div>

      {/* Active tab content */}
      {activeTab === "Geral" && <OverviewTab project={filteredProject} />}
      {activeTab === "Lista" && <ListTab project={filteredProject} />}
      {activeTab === "Quadro" && <BoardTab project={filteredProject} />}
      {activeTab === "Calendário" && <CalendarTab project={filteredProject} />}
    </>
  );
};
