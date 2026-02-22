import { profileService } from "@/src/server/db/services/profile.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const profile = await profileService.createProfile(body);

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}