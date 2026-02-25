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
import { motion, AnimatePresence } from "framer-motion";
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

const TAB_ORDER = tabs.map((t) => t.label);

export const TaskBoard = ({ initialProject }: TaskBoardProps) => {
  const [activeTab, setActiveTab] = useState<TabLabel>("Geral");
  const [prevTab, setPrevTab] = useState<TabLabel>("Geral");
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

  const handleTabChange = (tab: TabLabel) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  // Direção do slide: 1 = esquerda para direita, -1 = direita para esquerda
  const direction =
    TAB_ORDER.indexOf(activeTab) > TAB_ORDER.indexOf(prevTab) ? 1 : -1;

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
  const activeFilterLabel = STATUS_OPTIONS.find(
    (o) => o.value === filterStatus,
  )?.label;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir * 40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir * -40,
      opacity: 0,
    }),
  };

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
                onClick={() => handleTabChange(item.label)}
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
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
              isFiltered
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-gray-200 dark:border-gray-700 text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {isFiltered ? <X size={14} /> : <SlidersHorizontal size={14} />}
            {isFiltered ? activeFilterLabel : "Filtrar"}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-background shadow-lg py-1"
              >
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterStatus(option.value);
                      setFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn("w-2 h-2 rounded-full", option.dot)}
                      />
                      {option.label}
                    </span>
                    {filterStatus === option.value && (
                      <Check size={13} className="text-primary" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active tab content com slide */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.22,
              ease: [0.32, 0.72, 0, 1],
            }}
          >
            {activeTab === "Geral" && (
              <OverviewTab project={filteredProject} />
            )}
            {activeTab === "Lista" && <ListTab project={filteredProject} />}
            {activeTab === "Quadro" && <BoardTab project={filteredProject} />}
            {activeTab === "Calendário" && (
              <CalendarTab project={filteredProject} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};