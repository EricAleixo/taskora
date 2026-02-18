"use client";

import { Button } from "@/components/ui/button";
import { MdAdd } from "react-icons/md";
import { useState } from "react";
import { Task } from "@/app/types/Task";
import { CollapsibleStatistics } from "../molecules/CollapsibleStatistics/CollapsibleStatistics";
import { TasksCards } from "../molecules/TasksCard/TasksCards";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TasksTable } from "../organisms/Table/TaskTable";

const allTasks: Task[] = [
  {
    id: 1,
    title: "Logo Idea's visualizations from brainstorming session",
    description: "Create initial concepts for the new brand identity",
    startTime: "09:00",
    endTime: "11:00",
    date: "2026-02-15",
    duration: 120,
    status: "pending",
    createdAt: new Date("2026-02-10"),
    project: "Brand Relaunch 2026",
  },
  {
    id: 2,
    title: "Generate proposed colours for initiating proposal",
    description: null,
    startTime: "14:00",
    endTime: "15:30",
    date: "2026-02-15",
    duration: 90,
    status: "pending",
    createdAt: new Date("2026-02-11"),
    project: "Brand Relaunch 2026",
  },
  {
    id: 3,
    title: "Define brand tone and messaging guidelines",
    description: "Document voice, tone and style guide",
    startTime: "10:00",
    endTime: "13:00",
    date: "2026-02-15",
    duration: 180,
    status: "in_progress",
    createdAt: new Date("2026-02-12"),
    project: "Brand Relaunch 2026",
  },
  {
    id: 4,
    title: "Outline a marketing plan for the Super Bowl launch",
    description: null,
    startTime: null,
    endTime: null,
    date: "2026-02-16",
    duration: null,
    status: "in_progress",
    createdAt: new Date("2026-02-13"),
    project: "Marketing Campaign",
  },
  {
    id: 5,
    title: "Draft a press release for the brand relaunch",
    description: "Prepare official announcement",
    startTime: "15:00",
    endTime: "16:00",
    date: "2026-02-17",
    duration: 60,
    status: "pending",
    createdAt: new Date("2026-02-14"),
    project: "Brand Relaunch 2026",
  },
  {
    id: 6,
    title: "Coordinate with vendors for production materials",
    description: null,
    startTime: null,
    endTime: null,
    date: "2026-02-18",
    duration: null,
    status: "pending",
    createdAt: new Date("2026-02-14"),
    project: "Production Team",
  },
  {
    id: 7,
    title: "Review design mockups with stakeholders",
    description: "Completed all initial designs",
    startTime: "08:00",
    endTime: "10:00",
    date: "2026-02-14",
    duration: 120,
    status: "completed",
    createdAt: new Date("2026-02-10"),
    project: "Design Sprint",
  },
  {
    id: 8,
    title: "Update project documentation",
    description: null,
    startTime: "16:00",
    endTime: "17:00",
    date: "2026-02-14",
    duration: 60,
    status: "completed",
    createdAt: new Date("2026-02-13"),
    project: "Documentation",
  },
  {
    id: 9,
    title: "Team sync meeting - Q1 planning",
    description: "Quarterly planning session with all departments",
    startTime: "09:00",
    endTime: "10:30",
    date: "2026-02-20",
    duration: 90,
    status: "pending",
    createdAt: new Date("2026-02-15"),
    project: "Internal",
  },
  {
    id: 10,
    title: "Client presentation preparation",
    description: null,
    startTime: null,
    endTime: null,
    date: "2026-02-19",
    duration: null,
    status: "cancelled",
    createdAt: new Date("2026-02-12"),
    project: "Client Work",
  },
];


const TasksHeader = () => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tarefas</h1>
      <p className="text-sm text-gray-500">
        Gerencie todas as suas tarefas em um só lugar
      </p>
    </div>
    <Button className="w-full sm:w-auto">
      <MdAdd className="mr-2 h-5 w-5" />
      Nova Tarefa
    </Button>
  </div>
);

export const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showStatistics, setShowStatistics] = useState(true);

  // Filtrar tarefas
  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle seleção de tarefa
  const toggleTaskSelection = (taskId: number) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Selecionar/deselecionar todas
  const toggleAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((task) => task.id));
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header Fixo */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6 md:px-6">
          <TasksHeader />

          <CollapsibleStatistics
            isOpen={showStatistics}
            onToggle={() => setShowStatistics(!showStatistics)}
            tasks={allTasks}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Conteúdo Scrollável */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto px-4 py-6 md:px-6">
            <TasksTable
              tasks={filteredTasks}
              selectedTasks={selectedTasks}
              onToggleTask={toggleTaskSelection}
              onToggleAll={toggleAllTasks}
            />

            <TasksCards
              tasks={filteredTasks}
              selectedTasks={selectedTasks}
              onToggleTask={toggleTaskSelection}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
