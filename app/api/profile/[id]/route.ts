import { profileService } from "@/src/server/db/services/profile.service";
import { NextResponse } from "next/server";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_: Request, { params }: Params) {
  try {
    const profile = await profileService.getProfileById(
      Number(params.id)
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
      Number(id),
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
    const profile = await profileService.deleteProfile(
      Number(params.id)
    );

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }
}