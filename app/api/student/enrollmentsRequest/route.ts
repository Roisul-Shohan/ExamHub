import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();

  await db.execute(
    `INSERT INTO course_enrollments (courseId, studentId, status)
     VALUES (?, ?, 'PENDING')`,
    [courseId, session.user.id]
  );

  return NextResponse.json({ success: true });
}