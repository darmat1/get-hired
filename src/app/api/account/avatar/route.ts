import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AVATAR_MIME_TO_EXT, MAX_AVATAR_BYTES } from "@/lib/avatar-utils";

const AVATAR_BUCKET = "blog";
const AVATAR_FOLDER = "avatars";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase storage is not configured");
  }

  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const ext = AVATAR_MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP are supported" },
        { status: 400 },
      );
    }

    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "Avatar must be 200 KB or smaller" },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    const filePath = `${AVATAR_FOLDER}/${userId}.${ext}`;
    const supabase = getSupabaseClient();

    const pathsToRemove = [
      `${AVATAR_FOLDER}/${userId}.jpg`,
      `${AVATAR_FOLDER}/${userId}.png`,
      `${AVATAR_FOLDER}/${userId}.webp`,
    ];

    await supabase.storage.from(AVATAR_BUCKET).remove(pathsToRemove);

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const currentInfo = (existingProfile?.personalInfo as any) || {};

    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        personalInfo: {
          ...currentInfo,
          avatarUrl,
        },
      },
      create: {
        userId,
        personalInfo: {
          ...currentInfo,
          avatarUrl,
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { image: avatarUrl },
    });

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload avatar",
      },
      { status: 500 },
    );
  }
}
