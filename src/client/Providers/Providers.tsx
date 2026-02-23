"use client";

import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/src/client/Providers/QueryProvider";
import { ThemeSync } from "@/src/client/Providers/ThemeSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeSync />
        {children}
      </QueryProvider>
    </SessionProvider>
  );
}