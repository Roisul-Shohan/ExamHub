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

    // Get exams for courses where the student is enrolled (only PUBLISHED exams)
    const [exams] = await db.execute(
      `SELECT 
        e.id,
        e.courseId,
        c.name as courseName,
        c.code as courseCode,
        e.title,
        e.description,
        e.examDate,
        e.totalMarks,
        e.durationMinutes,
        e.startTime,
        e.endTime,
        e.negativeMark,
        e.status
       FROM exams e
       JOIN courses c ON e.courseId = c.id
       JOIN course_enrollments enroll ON c.id = enroll.courseId
       WHERE enroll.studentId = ? AND enroll.status = 'APPROVED' AND e.status = 'PUBLISHED'
       ORDER BY e.examDate DESC`,
      [studentId]
    );

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
