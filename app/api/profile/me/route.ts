import { profileService } from "@/src/server/db/services/profile.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const { user } = session;

    if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const profile = await profileService.getProfileByUserId(user.id);

  return NextResponse.json(profile); // pode ser null
} catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}