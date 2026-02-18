import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MdMoreHoriz } from "react-icons/md";
import { LuPlus, LuFolderOpen } from "react-icons/lu";
import { CardTask } from "../molecules/Cards/CardTask";
import { CiGrid41 } from "react-icons/ci";
import { Task } from "@/app/types/Task";
import { Project } from "@/app/types/Project";
import { AddTaskModal } from "../organisms/Modal/AddTaskModal";

// Classificação por status
const classifyTasks = (tasks: Task[]) => ({
  toDo: tasks.filter((t) => t.status === "pending"),
  inProgress: tasks.filter((t) => t.status === "in_progress"),
  review: tasks.filter((t) => t.status === "cancelled"),
  done: tasks.filter((t) => t.status === "completed"),
});

const ColumnHeader = ({ title, count }: { title: string; count: number }) => (
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

const Column = ({ title, tasks }: { title: string; tasks: Task[] }) => (
  <div className="flex flex-col min-w-70 lg:min-w-0">
    <ColumnHeader title={title} count={tasks.length} />
    <ScrollArea className="flex-1">
      <div className="space-y-3 pb-4">
        {tasks.map((task) => (
          <CardTask key={task.id} task={task} />
        ))}
        <AddTaskModal projectId={1} variant="ghost"/>
      </div>
    </ScrollArea>
  </div>
);

// Board reutilizável
const TaskBoard = ({ tasks }: { tasks: Task[] }) => {
  const columns = classifyTasks(tasks);

  const columnDefs = [
    { title: "To Do", tasks: columns.toDo },
    { title: "In Progress", tasks: columns.inProgress },
    { title: "Review", tasks: columns.review },
    { title: "Done", tasks: columns.done },
  ];

  return (
    <>
      {/* Desktop: 4 colunas */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6 bg-card p-3 rounded-xl border border-gray-100 shadow min-h-[calc(100vh-300px)]">
        {columnDefs.map((col) => (
          <Column key={col.title} title={col.title} tasks={col.tasks} />
        ))}
      </div>

      {/* Tablet: 2 colunas */}
      <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-4 bg-card p-3 rounded-xl border border-gray-100 shadow">
        {columnDefs.map((col) => (
          <Column key={col.title} title={col.title} tasks={col.tasks} />
        ))}
      </div>

      {/* Mobile: scroll horizontal */}
      <div className="md:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {columnDefs.map((col) => (
              <Column key={col.title} title={col.title} tasks={col.tasks} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
};

// Props do componente principal
interface ProjectPageProps {
  project: Project;
}

export const ProjectPage = ({ project }: ProjectPageProps) => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:justify-between md:p-6 md:pb-4">
          <nav className="flex items-center gap-2 text-muted-foreground text-lg md:text-2xl">
            <div className="flex items-center gap-1 md:gap-2 cursor-pointer group">
              <LuFolderOpen className="h-5 w-5 md:h-7 md:w-7 group-hover:text-foreground" />
              <span className="hover:text-foreground cursor-pointer group-hover:text-foreground">
                Projetos
              </span>
            </div>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-37.5 md:max-w-none">
              {project.title}
            </span>
          </nav>

          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
            <button className="flex items-center whitespace-nowrap bg-secondary text-secondary-foreground rounded p-2 text-sm md:text-base transition-all duration-150 hover:bg-secondary/90">
              <CiGrid41 className="mr-1 h-5 w-5 md:h-6 md:w-6" />
              <span className="hidden sm:inline">Todos os projetos</span>
              <span className="sm:hidden">Projetos</span>
            </button>
            <AddTaskModal projectId={project.id} />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold truncate mb-2">
              {project.title}
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              Suas tarefas para hoje, 15 de Fevereiro
            </p>
          </div>

          <TaskBoard tasks={project.tasks ?? []} />
        </div>
      </div>
    </div>
  );
};
