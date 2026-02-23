import { Params } from "@/app/types/App";
import { profileService } from "@/src/server/db/services/profile.service";
import { NextResponse } from "next/server";


export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const profile = await profileService.getProfileById(
      id
    );

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const { id } = await params;

    const profile = await profileService.updateProfile(
      id,
      body
    );

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const profile = await profileService.deleteProfile(
      id
    );

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }
}