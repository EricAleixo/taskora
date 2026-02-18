import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function RegisterLayout({children}: {children: ReactNode}){

    const session = await getServerSession(authOptions);
    if(session?.user) return redirect("/dashboard");

    return(
        <section className="h-screen w-screen">
            {children}
        </section>
    )
}