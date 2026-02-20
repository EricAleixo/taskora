import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { AppSidebar } from "../components/organisms/AppSideBar/AppSideBar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function ProjectLayout({children}: {children: ReactNode}) {

    const session = await getServerSession(authOptions);

    if(!session?.user) return redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <main className="w-full">
        {children}
      </main>
    </SidebarProvider>
  );
}
