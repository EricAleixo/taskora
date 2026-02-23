import { getUserAuthenticate } from "@/lib/getUserAuthenticate";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function RegisterLayout({
  children,
}: {
  children: ReactNode;
}) {

  const user = await getUserAuthenticate();
  if(user) return redirect("/projects");
  
  return <section className="h-screen w-screen">{children}</section>;
  
}