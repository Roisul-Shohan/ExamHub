import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const studentId = parseInt(resolvedParams.id);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { message: "Invalid student ID" },
        { status: 400 }
      );
    }

    if (session.user.id != studentId) {
      return NextResponse.json(
        { message: "Unauthorized - You can only view your own available courses" },
        { status: 403 }
      );
    }

    const [courses] = await db.execute(
      `SELECT
        c.id,
        c.name,
        c.description,
        c.code,
        c.teacherId,
        c.createdAt,
        c.updatedAt,
        u.name AS teacherName,
        (SELECT COUNT(*) FROM course_enrollments WHERE courseId = c.id AND status = 'APPROVED') AS students,
        (SELECT status FROM course_enrollments
         WHERE courseId = c.id AND studentId = ?
         ORDER BY createdAt DESC LIMIT 1) AS enrollmentStatus
       FROM courses c
       JOIN users u ON c.teacherId = u.id
       WHERE NOT EXISTS (
         SELECT 1 FROM course_enrollments
         WHERE courseId = c.id AND studentId = ? AND status IN ('PENDING', 'APPROVED')
       )
       ORDER BY c.createdAt DESC`,
      [studentId, studentId]
    );

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching available courses:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
