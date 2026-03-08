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

    // Get all exam attempts for this student
    const [attempts] = await db.execute(
      `SELECT 
        a.id,
        a.examId,
        a.studentId,
        a.startTime,
        a.endTime,
        a.score,
        e.totalMarks,
        a.status
       FROM exam_attempts a
       JOIN exams e ON a.examId = e.id
       WHERE a.studentId = ?
       ORDER BY a.startTime DESC`,
      [studentId]
    );

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Error fetching exam attempts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
