import { getUserAuthenticate } from "@/lib/getUserAuthenticate";
import { profileService } from "@/src/server/db/services/profile.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUserAuthenticate();

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