import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET all pending enrollment requests for the teacher's courses
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = parseInt(session.user.id as string);

    const [requests] = await db.query(
      `SELECT ce.id, ce.courseId, ce.studentId, ce.status, ce.createdAt,
              c.name AS courseName, c.code AS courseCode,
              u.name AS studentName, u.email AS studentEmail
       FROM course_enrollments ce
       JOIN courses c ON ce.courseId = c.id
       JOIN users u ON ce.studentId = u.id
       WHERE c.teacherId = ? AND ce.status = 'PENDING'
       ORDER BY ce.createdAt DESC`,
      [teacherId]
    );

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Fetch enrollment requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
