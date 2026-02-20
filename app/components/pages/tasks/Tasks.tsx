"use client";

import { Button } from "@/components/ui/button";
import { MdAdd } from "react-icons/md";
import { useState } from "react";
import { CollapsibleStatistics } from "../../molecules/CollapsibleStatistics/CollapsibleStatistics";
import { TasksCards } from "../../molecules/TasksCard/TasksCards";
import { TasksTable } from "../../organisms/Table/TaskTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasks } from "@/src/client/services/tasks/useTasks";

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
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showStatistics, setShowStatistics] = useState(true);

  const { data: allTasks = [] } = useTasks();

  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleTaskSelection = (taskId: number) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

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