import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Dashboard } from "@/app/components/pages/Dashboard";
import { getServerSession } from "next-auth";

export default async function DashboardPage(){

    const session = await getServerSession(authOptions);

    return <Dashboard/>;
}