"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const ProfileDropdown = dynamic(
  () => import("./ProfileDropDown").then((mod) => mod.profileDropdown),
  { ssr: false },
);

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
  LuSearch,
  LuFolder,
  LuSquareCheck,
  LuCommand,
  LuChevronUp,
  LuChevronDown,
} from "react-icons/lu";
import Link from "next/link";
import { useProjects } from "@/src/client/services/project/useProjects";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSideBarI } from "@/app/types/App";
import Logo from "../../atoms/Logo";
import { SearchModal } from "../Modal/SearchModal";
import { AnimatePresence, motion } from "framer-motion";

export const AppSidebar = (props: AppSideBarI) => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isOnProjectsPage =
    pathname === "/projects" || pathname.startsWith("/projects/");

  const { data, isPending, error } = useProjects();

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (error) return null;

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center justify-center">
            <Logo />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          {/* Pesquisa */}
          <SidebarGroup className="mb-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="w-full justify-start gap-3"
                  onClick={() => setSearchOpen(true)}
                >
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
                  <SidebarMenuItem>
                    <div className="flex items-center gap-3 px-2 py-1.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="ml-auto h-5 w-6 rounded-full" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </SidebarMenuItem>
                  <div className="ml-6 space-y-1 mt-2 mb-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-md" />
                    ))}
                  </div>
                  <SidebarMenuItem>
                    <div className="flex items-center gap-3 px-2 py-1.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="ml-auto h-5 w-6 rounded-full" />
                    </div>
                  </SidebarMenuItem>
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
                      onClick={() => {
                        if (isOnProjectsPage) {
                          setIsProjectsOpen(!isProjectsOpen);
                        } else {
                          router.push("/projects");
                        }
                      }}
                    >
                      <LuFolder className="h-4 w-4" />
                      <span>Projetos</span>
                      <Badge className="ml-auto bg-primary text-primary-foreground h-5 px-2 text-xs">
                        {data.length}
                      </Badge>
                      {data.length !== 0 &&
                        (isProjectsOpen ? (
                          <LuChevronUp className="h-4 w-4" />
                        ) : (
                          <LuChevronDown className="h-4 w-4" />
                        ))}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Lista de Projetos */}
                  <AnimatePresence>
                    {isProjectsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="ml-4 mt-1 mb-2 relative overflow-hidden"
                      >
                        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                        <div className="space-y-0.5">
                          {data.map((project, index) => (
                            <motion.div
                              key={project.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: index * 0.04,
                                duration: 0.2,
                              }}
                            >
                              <Link href={`/projects/${project.id}`}>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal relative pl-6 group"
                                >
                                  <span className="absolute left-2 top-1/2 w-3 h-px bg-border group-hover:bg-primary/50 transition-colors" />
                                  <span>{project.title}</span>
                                </Button>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tarefas */}
                  <SidebarMenuItem>
                    <Link href="/tasks">
                      <SidebarMenuButton className="w-full justify-start gap-3">
                        <LuSquareCheck className="h-4 w-4" />
                        <span>Tarefas</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          {props.profile && (
            <ProfileDropdown profile={props.profile} user={props.user} />
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Modal de busca — fora do Sidebar para ficar sobre tudo */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
