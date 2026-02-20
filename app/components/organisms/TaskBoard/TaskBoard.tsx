"use client";

import { useQuery } from "@tanstack/react-query";
import { Project } from "@/app/types/Project";
import { ProjectClientService } from "@/src/client/services/project/project.client.service";
import { cn } from "@/lib/utils";
import { LayoutDashboard, List, Columns2, CalendarRange, BarChart2, Calendar, Folder } from "lucide-react";
import { useState } from "react";
import { BoardTab } from "../../molecules/TasksDisplay/BoardTab";
import { CalendarTab } from "../../molecules/TasksDisplay/CalendarTab";
import { ListTab } from "../../molecules/TasksDisplay/ListTab";
import { OverviewTab } from "../../molecules/TasksDisplay/OverviewTab";


interface TaskBoardProps {
  initialProject: Project;
}

export const TaskBoard = ({ initialProject }: TaskBoardProps) => {
  const { data: project } = useQuery({
    queryKey: ["project", initialProject.id],
    queryFn: () => ProjectClientService.getById(initialProject.id),
    initialData: initialProject,
  });

  const [activeTab, setActiveTab] = useState("Geral");

  const navItems = [
    {
      label: "Geral",
      icon: <LayoutDashboard size={15} />,
      component: <OverviewTab project={project} />,
    },
    {
      label: "Lista",
      icon: <List size={15} />,
      component: <ListTab project={project} />,
    },
    {
      label: "Quadro",
      icon: <Columns2 size={15} />,
      component: <BoardTab project={project} />,
    },
    {
      label: "Calendário",
      icon: <Calendar size={15} />,
      component: <CalendarTab project={project} />,
    },
  ];

  const activeItem = navItems.find((item) => item.label === activeTab);

  return (
    <>
      {/* Navbar */}
      <div className="flex items-center gap-1 mb-3 border-b border-gray-200 dark:border-gray-700 px-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t transition-colors relative",
              activeTab === item.label
                ? "text-primary border-b-2 border-primary -mb-px"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {activeItem?.component}
    </>
  );
};
