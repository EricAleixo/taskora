"use client";

import { Project } from "@/app/types/Project";
import { cn } from "@/lib/utils";
import { LayoutDashboard, List, Columns2, Calendar } from "lucide-react";
import { useState } from "react";
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

export const TaskBoard = ({ initialProject: project }: TaskBoardProps) => {
  const [activeTab, setActiveTab] = useState<TabLabel>("Geral");

  return (
    <>
      {/* Navbar */}
      <div className="flex items-center gap-1 mb-3 border-b border-gray-200 dark:border-gray-700 px-1">
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

      {/* Active tab content — project sempre atualizado */}
      {activeTab === "Geral" && <OverviewTab project={project} />}
      {activeTab === "Lista" && <ListTab project={project} />}
      {activeTab === "Quadro" && <BoardTab project={project} />}
      {activeTab === "Calendário" && <CalendarTab project={project} />}
    </>
  );
};
