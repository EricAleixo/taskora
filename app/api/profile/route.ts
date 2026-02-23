import { profileService } from "@/src/server/db/services/profile.service";
import { NextResponse } from "next/server";
import { getUserAuthenticate } from "@/lib/getUserAuthenticate";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const user = await getUserAuthenticate();

    const profile = await profileService.createProfile(Number(user.id),body);

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.log(error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}