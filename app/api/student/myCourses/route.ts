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
        (SELECT COUNT(*) FROM course_enrollments WHERE courseId = c.id AND status = 'APPROVED') as students,
        e.status as enrollmentStatus
       FROM courses c
       JOIN course_enrollments e ON c.id = e.courseId
       JOIN users u ON c.teacherId = u.id
       WHERE e.studentId = ? AND e.status = 'APPROVED'
       ORDER BY e.approvedAt DESC`,
      [studentId]
    );

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
