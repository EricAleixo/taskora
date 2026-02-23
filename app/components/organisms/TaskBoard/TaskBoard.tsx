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

export type FilterStatus = "all" | "pending" | "in_progress" | "review" | "completed";

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
        {/* Tabs */}
        <div className="flex items-center gap-1 flex-1">
          {tabs.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t transition-colors relative",
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

        {/* Filter button */}
        <div className="relative pb-px" ref={filterRef}>
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150",
              isFiltered
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
            )}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtrar</span>
            {isFiltered && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                1
              </span>
            )}
          </button>

          {/* Dropdown */}
          {filterOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 bg-popover border border-border rounded-xl shadow-lg p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </span>
                {isFiltered && (
                  <button
                    onClick={() => {
                      setFilterStatus("all");
                      setFilterOpen(false);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <X size={11} />
                    Limpar
                  </button>
                )}
              </div>

              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilterStatus(opt.value);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    filterStatus === opt.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", opt.dot)} />
                    {opt.label}
                  </div>
                  {filterStatus === opt.value && (
                    <Check size={13} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
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