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

    // Verify course belongs to teacher
    const [course] = await db.execute(
      "SELECT * FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, session.user.id]
    );

    if (!(course as any[]).length) {
      return NextResponse.json({ error: "Course not found or not owned by you" }, { status: 404 });
    }

    // Get all exams for this course
    const [exams] = await db.execute(
      "SELECT id, title, totalMarks FROM exams WHERE courseId = ?",
      [courseId]
    );

    // Get all exam attempts for students enrolled in this course
    const [attempts] = await db.execute(
      `SELECT 
        ea.id as attemptId,
        ea.examId,
        ea.studentId,
        ea.score,
        ea.totalMarks as attemptTotalMarks,
        ea.status,
        ea.startTime,
        ea.endTime,
        u.name as studentName,
        e.title as examTitle,
        e.totalMarks as examTotalMarks
      FROM exam_attempts ea
      JOIN users u ON ea.studentId = u.id
      JOIN exams e ON ea.examId = e.id
      WHERE e.courseId = ?
      ORDER BY ea.endTime DESC`,
      [courseId]
    );

    // Get all enrolled students for this course
    const [enrollments] = await db.execute(
      `SELECT 
        ce.studentId,
        u.name as studentName
      FROM course_enrollments ce
      JOIN users u ON ce.studentId = u.id
      WHERE ce.courseId = ? AND ce.status = 'APPROVED'`,
      [courseId]
    );

    return NextResponse.json({
      exams: exams,
      attempts: attempts,
      enrollments: enrollments
    });
  } catch (error) {
    console.error("Fetch exam results error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
