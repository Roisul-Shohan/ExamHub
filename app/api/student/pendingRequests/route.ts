import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const studentId = session.user.id;

    // Get all pending enrollment requests for this student
    const [requests] = await db.execute(
      `SELECT 
        e.id,
        e.courseId,
        e.studentId,
        e.status,
        e.createdAt,
        c.name as courseName,
        c.code as courseCode,
        c.description as courseDescription,
        u.name as teacherName
       FROM course_enrollments e
       JOIN courses c ON e.courseId = c.id
       JOIN users u ON c.teacherId = u.id
       WHERE e.studentId = ? AND e.status = 'PENDING'
       ORDER BY e.createdAt DESC`,
      [studentId]
    );

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
