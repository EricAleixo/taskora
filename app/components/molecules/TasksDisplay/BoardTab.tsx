import { Task } from "@/app/types/Task";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { classifyTasks } from "@/lib/classifyTasks";
import { AnimatePresence, motion } from "framer-motion";
import { CardTask } from "../../molecules/Cards/CardTask";
import { MdMoreHoriz } from "react-icons/md";
import { LuPlus, LuChevronRight } from "react-icons/lu";
import { useRef, useState, useEffect } from "react";
import { TaskForm } from "../../organisms/Modal/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BoardTabProps {
  project: any;
}

type TaskStatus =
  | "pending"
  | "completed"
  | "in_progress"
  | "cancelled"
  | "review";

const statusColors: Record<string, string> = {
  "Para Fazer": "bg-amber-400",
  "Em Progresso": "bg-blue-400",
  Revisando: "bg-purple-400",
  Finalizada: "bg-green-400",
};

const ColumnHeader = ({ title, count }: { title: string; count: number }) => (
  <div className="w-full flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${statusColors[title] ?? "bg-gray-400"}`}
      />
      <h3 className="font-semibold">{title}</h3>
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full" />
        <p className="text-gray-500">{count}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
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
  projectId,
  defaultStatus = "pending",
}: {
  title: string;
  tasks: Task[];
  projectId: number;
  defaultStatus?: TaskStatus;
}) => (
  <div className="flex flex-col min-w-70 lg:min-w-0">
    <ColumnHeader title={title} count={tasks.length} />
    <ScrollArea className="flex-1">
      <div className="space-y-3 pb-4">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div
                className="transition-opacity duration-300"
                style={{ opacity: task.isOptimistic ? 0.5 : 1 }}
              >
                <CardTask task={task} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <TaskForm projectId={projectId}>
          <Button
            className="text-gray-600 w-full justify-start"
            variant={"ghost"}
          >
            <Plus></Plus>
            Adicionar
          </Button>
        </TaskForm>
      </div>
    </ScrollArea>
  </div>
);

/** Dot indicators showing which column is most visible on mobile */
const MobileDotIndicators = ({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) => (
  <div className="flex items-center justify-center gap-1.5 mt-3">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          width: i === activeIndex ? 20 : 6,
          opacity: i === activeIndex ? 1 : 0.35,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`h-1.5 rounded-full ${
          i === activeIndex ? "bg-primary" : "bg-gray-300"
        }`}
      />
    ))}
  </div>
);

/** Fade + chevron hint that fades away after first scroll */
const SwipeHint = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center pr-2 z-10"
      >
        {/* Gradient fade on the right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-background to-transparent" />
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="relative z-10 text-primary/70"
        >
          <LuChevronRight className="h-6 w-6" />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const MobileBoardScroll = ({
  columnDefs,
  projectId,
}: {
  columnDefs: { title: string; tasks: Task[]; defaultStatus: TaskStatus }[];
  projectId: number;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);

  // Track which column is most visible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (showHint) setShowHint(false);
      const scrollLeft = el.scrollLeft;
      const colWidth = el.scrollWidth / columnDefs.length;
      const idx = Math.round(scrollLeft / colWidth);
      setActiveIndex(Math.min(Math.max(idx, 0), columnDefs.length - 1));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [columnDefs.length, showHint]);

  return (
    <div className="md:hidden">
      {/* Column name pill tabs for quick orientation */}
      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none px-1 pb-1">
        {columnDefs.map((col, i) => (
          <button
            key={col.title}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              const colWidth = el.scrollWidth / columnDefs.length;
              el.scrollTo({ left: colWidth * i, behavior: "smooth" });
            }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
              i === activeIndex
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusColors[col.title] ?? "bg-gray-400"}`}
            />
            {col.title}
            <span className="opacity-60 text-xs">({col.tasks.length})</span>
          </button>
        ))}
      </div>

      {/* Scrollable board */}
      <div className="relative">
        <SwipeHint visible={showHint} />
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {columnDefs.map((col) => (
            <div
              key={col.title}
              className="snap-start shrink-0 w-[85vw] max-w-sm bg-card border border-gray-100 shadow rounded-xl p-3"
            >
              <Column
                title={col.title}
                tasks={col.tasks}
                projectId={projectId}
                defaultStatus={col.defaultStatus}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot progress indicators */}
      <MobileDotIndicators
        total={columnDefs.length}
        activeIndex={activeIndex}
      />
    </div>
  );
};

export const BoardTab = ({ project }: BoardTabProps) => {
  const columns = classifyTasks(project.tasks ?? []);

  const columnDefs = [
    {
      title: "Para Fazer",
      tasks: columns.toDo,
      defaultStatus: "pending" as TaskStatus,
    },
    {
      title: "Em Progresso",
      tasks: columns.inProgress,
      defaultStatus: "in_progress" as TaskStatus,
    },
    {
      title: "Revisando",
      tasks: columns.review,
      defaultStatus: "review" as TaskStatus,
    },
    {
      title: "Finalizada",
      tasks: columns.done,
      defaultStatus: "completed" as TaskStatus,
    },
  ];

  return (
    <>
      {/* Desktop: 4 colunas */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6 bg-card p-3 rounded-xl border border-gray-100 shadow min-h-[calc(100vh-300px)]">
        {columnDefs.map((col) => (
          <Column
            key={col.title}
            title={col.title}
            tasks={col.tasks}
            projectId={project.id}
            defaultStatus={col.defaultStatus}
          />
        ))}
      </div>

      {/* Tablet: 2 colunas */}
      <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-4 bg-card p-3 rounded-xl border border-gray-100 shadow">
        {columnDefs.map((col) => (
          <Column
            key={col.title}
            title={col.title}
            tasks={col.tasks}
            projectId={project.id}
            defaultStatus={col.defaultStatus}
          />
        ))}
      </div>

      {/* Mobile: snap scroll com indicadores */}
      <MobileBoardScroll columnDefs={columnDefs} projectId={project.id} />
    </>
  );
};
