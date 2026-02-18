"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LuSearch,
  LuActivity,
  LuFolder,
  LuSquareCheck,
  LuCommand,
  LuChevronUp,
  LuChevronDown,
} from "react-icons/lu";
import { MdOutlineExpandMore } from "react-icons/md";
import { useState } from "react";
import Link from "next/link";
import { LogOutBtn } from "../../atoms/Buttons/LogOutBtn";
import { useProjects } from "@/src/client/services/project/useProjects";
import { Skeleton } from "@/components/ui/skeleton";

type AppSideBarI = {
  user: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  };
};

export const AppSidebar = ({ user }: AppSideBarI) => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const { data, isPending, error } = useProjects();

  if (error) return <p>Erro!</p>;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h2 className="font-semibold text-sm">One Agency</h2>
              <p className="text-xs text-muted-foreground">
                Equipe de Negócios
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MdOutlineExpandMore className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Pesquisa */}
        <SidebarGroup className="mb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start gap-3">
                <LuSearch className="h-4 w-4" />
                <span>Pesquisar</span>
                <div className="ml-auto flex gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <LuCommand className="h-3 w-3" />K
                  </kbd>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground font-semibold mb-2">
            MENU PRINCIPAL
          </SidebarGroupLabel>
          {isPending ? (
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Skeleton do item "Projetos" */}
                <SidebarMenuItem>
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="ml-auto h-5 w-6 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                </SidebarMenuItem>

                {/* Skeleton dos itens de projeto */}
                <div className="ml-6 space-y-1 mt-2 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-md" />
                  ))}
                </div>

                {/* Skeleton do item "Tarefas" */}
                <SidebarMenuItem>
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="ml-auto h-5 w-6 rounded-full" />
                  </div>
                </SidebarMenuItem>

                {/* Skeleton do item "Atividades" */}
                <SidebarMenuItem>
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          ) : (
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Projetos */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="w-full justify-start gap-3"
                    onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                  >
                    <LuFolder className="h-4 w-4" />
                    <span>Projetos</span>
                    <Badge className="ml-auto bg-primary text-primary-foreground h-5 px-2 text-xs">
                      {data.length}
                    </Badge>
                    {isProjectsOpen ? (
                      <LuChevronUp className="h-4 w-4" />
                    ) : (
                      <LuChevronDown className="h-4 w-4" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Lista de Projetos */}
                {isProjectsOpen && (
                  <div className="ml-6 space-y-1 mt-2 mb-2">
                    {data.map((project) => (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal"
                        >
                          <span>{project.title}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Tarefas */}
                <SidebarMenuItem>
                  <Link href={"/tasks"}>
                    <SidebarMenuButton className="w-full justify-start gap-3">
                      <LuSquareCheck className="h-4 w-4" />
                      <span>Tarefas</span>
                      <Badge className="ml-auto bg-primary text-primary-foreground h-5 px-2 text-xs">
                        10
                      </Badge>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                {/* Atividades */}
                <SidebarMenuItem>
                  <SidebarMenuButton className="w-full justify-start gap-3">
                    <LuActivity className="h-4 w-4" />
                    <span>Atividades</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {user.image && user.name && user.email && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between gap-3 h-auto p-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0 text-left">
                    <p className="font-semibold text-sm truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <LuChevronUp className="h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <LogOutBtn></LogOutBtn>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
