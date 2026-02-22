"use client";

import { useCurrentProfile } from "@/src/client/services/profiles/useCurrentProfile";
import { ReactNode } from "react";
import { CompleteProfileScreen } from "../pages/profile/CompleteProfileScreen";

interface Props {
  children: ReactNode;
}

export function ProfileGate({ children }: Props) {
  const { data: profile, isLoading } = useCurrentProfile();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  // 🔥 Se não tiver perfil
  if (!profile) {
    return <CompleteProfileScreen />;
  }

  // ✅ Se tiver perfil
  return <>{children}</>;
}