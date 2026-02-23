"use client";

import { useCurrentProfile } from "@/src/client/services/profiles/useCurrentProfile";
import { ReactNode, useEffect, useState } from "react";
import { CompleteProfileScreen } from "../pages/profile/CompleteProfileScreen";
import { User } from "@/app/types/User";
import Logo from "../atoms/Logo";

interface Props {
  children: ReactNode;
  user: User;
}

export function ProfileGate({ children, user }: Props) {
  const { data: profile, isLoading } = useCurrentProfile();

  const [minimumLoadingDone, setMinimumLoadingDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingDone(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const shouldShowLoading = isLoading || !minimumLoadingDone;

  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center h-dvh w-full">
        <Logo variant="loading" />
      </div>
    );
  }

  if (!profile) {
    return <CompleteProfileScreen user={user} />;
  }

  return <>{children}</>;
}
