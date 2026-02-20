import Link from "next/link";

import { LuFolderOpen } from "react-icons/lu";
import { CiGrid41 } from "react-icons/ci";
import { Project } from "@/app/types/Project";
import { TaskForm } from "../../organisms/Modal/TaskForm";
import { TaskBoard } from "../../organisms/TaskBoard/TaskBoard";
import { ProjectHeaderInfo } from "../../organisms/ProjectHeader/ProjectHeaderInfo";

interface ProjectPageProps {
  project: Project;
}

export const ProjectShowPage = ({ project }: ProjectPageProps) => {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:justify-between md:p-6 md:pb-4">
          <nav className="flex items-center gap-2 text-muted-foreground text-lg md:text-2xl">
            <div className="flex items-center gap-1 md:gap-2 cursor-pointer group">
              <LuFolderOpen className="h-5 w-5 md:h-7 md:w-7 group-hover:text-foreground" />
              <Link href="/projects">
                <span className="hover:text-foreground cursor-pointer group-hover:text-foreground">
                  Projetos
                </span>
              </Link>
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
            <TaskForm projectId={project.id} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          <ProjectHeaderInfo project={project}/>

          {/* Client component — recebe os dados iniciais do SSR */}
          <TaskBoard initialProject={project} />
        </div>
      </div>
    </div>
  );
};
