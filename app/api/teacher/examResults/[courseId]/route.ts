import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.courseId);

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const [course] = await db.execute(
      "SELECT * FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, session.user.id]
    );

    if (!(course as any[]).length) {
      return NextResponse.json({ error: "Course not found or not owned by you" }, { status: 404 });
    }

    const [exams] = await db.execute(
      "SELECT id AS id, title AS title, totalMarks AS totalMarks FROM exams WHERE courseId = ?",
      [courseId]
    );

    const [attempts] = await db.execute(
      `SELECT 
        ea.id AS attemptId,
        ea.examId,
        ea.studentId,
        ea.score,
        ea.totalMarks AS attemptTotalMarks,
        ea.status,
        ea.startTime,
        ea.endTime,
        u.name AS studentName,
        e.title AS examTitle,
        e.totalMarks AS examTotalMarks
      FROM exam_attempts ea
      JOIN users u ON ea.studentId = u.id
      JOIN exams e ON ea.examId = e.id
      WHERE e.courseId = ?
      ORDER BY ea.endTime DESC`,
      [courseId]
    );

    const [enrollments] = await db.execute(
      `SELECT 
        ce.studentId,
        u.name AS studentName
      FROM course_enrollments ce
      JOIN users u ON ce.studentId = u.id
      WHERE ce.courseId = ? AND ce.status = 'APPROVED'`,
      [courseId]
    );

    return NextResponse.json({
      exams,
      attempts,
      enrollments
    });
  } catch (error) {
    console.error("Fetch exam results error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
