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

    // Get all courses where the student is NOT enrolled (excluding pending requests)
    // Only returns courses where there is NO enrollment record at all
    const [courses] = await db.execute(
      `SELECT 
        c.id, 
        c.name, 
        c.description,
        c.code, 
        c.teacherId, 
        c.createdat as createdAt, 
        c.updatedat as updatedAt,
        u.name as teacherName,
        (SELECT COUNT(*) FROM course_enrollments WHERE courseId = c.id AND status = 'APPROVED') as students
       FROM courses c
       LEFT JOIN course_enrollments e ON c.id = e.courseId AND e.studentId = ?
       JOIN users u ON c.teacherId = u.id
       WHERE e.id IS NULL
       ORDER BY c.createdat DESC`,
      [studentId]
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
