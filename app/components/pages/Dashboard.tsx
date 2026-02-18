import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MdAdd, MdMoreHoriz } from "react-icons/md";
import { LuPlus, LuFolderOpen } from "react-icons/lu";
import { CardTask } from "../molecules/Cards/CardTask";
import { CiGrid41 } from "react-icons/ci";
import { Task } from "@/app/types/Task";


// Mock data
const mockTasks: {
  toDo: Task[];
  inProgress: Task[];
  review: Task[];
  done: Task[];
} = {
  toDo: [
    {
      id: 1,
      title: "Logo Idea's visualizations from brainstorming session",
      description: "Create initial concepts for the new brand identity",
      startTime: "09:00",
      endTime: null,
      date: "2026-02-15",
      duration: 120,
      status: "pending",
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "Generate proposed colours for initiating proposal",
      description: null,
      startTime: "14:00",
      endTime: null,
      date: "2026-02-15",
      duration: 90,
      status: "pending",
      createdAt: new Date(),
    },
  ],
  inProgress: [
    {
      id: 3,
      title: "Define brand tone and messaging guidelines",
      description: "Document voice, tone and style guide",
      startTime: "10:00",
      endTime: null,
      date: "2026-02-15",
      duration: 180,
      status: "in_progress",
      createdAt: new Date(),
    },
    {
      id: 4,
      title: "Outline a marketing plan for the Super Bowl launch",
      description: null,
      startTime: null,
      endTime: null,
      date: "2026-02-15",
      duration: null,
      status: "in_progress",
      createdAt: new Date(),
    },
  ],
  review: [
    {
      id: 5,
      title: "Draft a press release for the brand relaunch",
      description: "Prepare official announcement",
      startTime: "15:00",
      endTime: null,
      date: "2026-02-15",
      duration: 60,
      status: "pending",
      createdAt: new Date(),
    },
    {
      id: 6,
      title: "Coordinate with vendors for production materials",
      description: null,
      startTime: null,
      endTime: null,
      date: "2026-02-15",
      duration: null,
      status: "pending",
      createdAt: new Date(),
    },
  ],
  done: [
    {
      id: 7,
      title: "Logo Idea's visualizations from brainstorming session",
      description: "Completed all initial designs",
      startTime: "08:00",
      endTime: "10:00",
      date: "2026-02-15",
      duration: 120,
      status: "completed",
      createdAt: new Date(),
    },
    {
      id: 8,
      title: "Define brand tone and messaging guidelines",
      description: null,
      startTime: null,
      endTime: null,
      date: "2026-02-15",
      duration: null,
      status: "completed",
      createdAt: new Date(),
    },
  ],
};

const ColumnHeader = ({
  title,
  count,
  onAdd,
}: {
  title: string;
  count: number;
  onAdd?: () => void;
}) => (
  <div className="w-full flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text">{title}</h3>
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        <p className="text-gray-500 text">{count}</p>
      </div>
    </div>
    <div className="items-center gap-3">
      <button className="hover:bg-primary/20 p-1 rounded-full">
        <LuPlus className="h-6 w-6" />
      </button>
      <button className="hover:text-primary/80 p-1 rounded-full">
        <MdMoreHoriz className="h-6 w-6" />
      </button>
    </div>
  </div>
);

const Column = ({
  title,
  tasks,
  onAdd,
}: {
  title: string;
  tasks: Task[];
  onAdd?: () => void;
}) => (
  <div className="flex flex-col min-w-70 lg:min-w-0">
    <ColumnHeader title={title} count={tasks.length} onAdd={onAdd} />
    <ScrollArea className="flex-1">
      <div className="space-y-3 pb-4">
        {tasks.map((task) => (
          <CardTask key={task.id} task={task} />
        ))}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <MdAdd className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>
    </ScrollArea>
  </div>
);

export const Dashboard = () => {
  // Mock project name - você pode receber isso como prop ou de um contexto
  const projectName = "Brand Relaunch 2026";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Breadcrumb - Fixo */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:justify-between md:p-6 md:pb-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-muted-foreground text-lg md:text-2xl">
            <div className="flex items-center gap-1 md:gap-2 cursor-pointer group">
              <LuFolderOpen className="h-5 w-5 md:h-7 md:w-7 group-hover:text-foreground" />
              <span className="hover:text-foreground cursor-pointer group-hover:text-foreground ">
                Projetos
              </span>
            </div>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-37.5 md:max-w-none">
              {projectName}
            </span>
          </nav>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
            <button className="flex items-center whitespace-nowrap bg-secondary text-secondary-foreground rounded p-2 text-sm md:text-base transition-all duration-150 hover:bg-secondary/90">
              <CiGrid41 className="mr-1 h-5 w-5 md:h-6 md:w-6" />
              <span className="hidden sm:inline">Todos os projetos</span>
              <span className="sm:hidden">Projetos</span>
            </button>
            <button className="flex items-center whitespace-nowrap bg-primary rounded p-2 text-primary-foreground text-sm md:text-base transition-all duration-150 hover:bg-primary/90">
              <MdAdd className="mr-1 h-5 w-5 md:h-6 md:w-6" />
              <span className="hidden sm:inline">Adicionar Tarefa</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Scrollável */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <div className="flex mb-2">
              <h1 className="text-xl md:text-2xl font-bold truncate">
                {projectName}
              </h1>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">
              Suas tarefas para hoje, 15 de Fevereiro
            </p>
          </div>

          {/* Desktop: 4 columns */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 bg-card p-3 rounded-xl border border-gray-100 shadow min-h-[calc(100vh-300px)]">
            <Column title="To Do" tasks={mockTasks.toDo} />
            <Column title="In Progress" tasks={mockTasks.inProgress} />
            <Column title="Review" tasks={mockTasks.review} />
            <Column title="Done" tasks={mockTasks.done} />
          </div>

          {/* Tablet: 2 columns */}
          <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-4 bg-card p-3 rounded-xl border border-gray-100 shadow">
            <Column title="To Do" tasks={mockTasks.toDo} />
            <Column title="In Progress" tasks={mockTasks.inProgress} />
            <Column title="Review" tasks={mockTasks.review} />
            <Column title="Done" tasks={mockTasks.done} />
          </div>

          {/* Mobile: Single scrollable column */}
          <div className="md:hidden">
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                <Column title="To Do" tasks={mockTasks.toDo} />
                <Column title="In Progress" tasks={mockTasks.inProgress} />
                <Column title="Review" tasks={mockTasks.review} />
                <Column title="Done" tasks={mockTasks.done} />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};