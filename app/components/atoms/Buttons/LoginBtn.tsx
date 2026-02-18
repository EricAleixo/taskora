"use client"

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export const LoginBtn = () => {
  return (
    <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} variant="outline" className="w-full">
      <FcGoogle className="size-6" /> Login com o Google
    </Button>
  );
};
