import { SidebarProvider } from "@/components/ui/sidebar";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";
import { profileService } from "@/src/server/db/services/profile.service";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { ProfileGate } from "../components/guards/ProfileGate";
import { AppSidebar } from "../components/organisms/AppSideBar/AppSideBar";
import { AppSideBarI } from "../types/App";

export default async function ProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUserAuthenticate();

  // 🔥 Só bloqueia se não estiver logado
  if (!user) {
    redirect("/login");
  }

  // Perfil agora é opcional
  const data = await profileService.getProfileByUserId(user.id);

  const sidebarData: AppSideBarI = {
    profile: {
      name: data?.profile.name ?? user.email,
      avatarUrl: data?.profile.avatarUrl ?? null,
    },
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };

  return (
    <ProfileGate user={user}>
      <SidebarProvider>
        <AppSidebar
          profile={sidebarData.profile}
          user={sidebarData.user}
        />
        <main className="w-full">{children}</main>
      </SidebarProvider>
    </ProfileGate>
  );
}