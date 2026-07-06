import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();
  const studentId = session.user.id;

  // If a PENDING request already exists, don't duplicate it
  const [existingPending] = await db.execute(
    `SELECT id FROM course_enrollments
     WHERE courseId = ? AND studentId = ? AND status = 'PENDING'`,
    [courseId, studentId]
  );

  if ((existingPending as any[]).length > 0) {
    return NextResponse.json({ success: true, message: "Already pending" });
  }

  // If a previous request was REJECTED, reset it back to PENDING so the teacher sees it again
  const [existingRejected] = await db.execute(
    `SELECT id FROM course_enrollments
     WHERE courseId = ? AND studentId = ? AND status = 'REJECTED'
     ORDER BY createdAt DESC LIMIT 1`,
    [courseId, studentId]
  );

  if ((existingRejected as any[]).length > 0) {
    await db.execute(
      `UPDATE course_enrollments
       SET status = 'PENDING', createdAt = NOW(), approvedAt = NULL
       WHERE id = ?`,
      [(existingRejected as any[])[0].id]
    );
    return NextResponse.json({ success: true, message: "Request resubmitted" });
  }

  await db.execute(
    `INSERT INTO course_enrollments (courseId, studentId, status)
     VALUES (?, ?, 'PENDING')`,
    [courseId, studentId]
  );

  return NextResponse.json({ success: true });
}