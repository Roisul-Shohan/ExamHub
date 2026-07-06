import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
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
    const examId = parseInt(resolvedParams.examId);

    if (isNaN(examId)) {
      return NextResponse.json(
        { message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const studentId = session.user.id;

    const [enrollment] = await db.execute(
      `SELECT e.id 
       FROM course_enrollments e
       JOIN exams ex ON e.courseId = ex.courseId
       WHERE e.studentId = ? AND ex.id = ? AND e.status = 'APPROVED'`,
      [studentId, examId]
    );

    if (!(enrollment as any[]).length) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const [questions] = await db.execute(
      `SELECT id AS id, examId AS examId, questionText AS questionText, optionA AS optionA, optionB AS optionB, optionC AS optionC, optionD AS optionD, correctOption AS correctOption, marks AS marks
       FROM questions
       WHERE examId = ?
       ORDER BY id`,
      [examId]
    );

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
