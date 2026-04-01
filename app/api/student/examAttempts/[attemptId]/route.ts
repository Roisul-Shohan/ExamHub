import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
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
    const attemptId = parseInt(resolvedParams.attemptId);

    if (isNaN(attemptId)) {
      return NextResponse.json(
        { message: "Invalid attempt ID" },
        { status: 400 }
      );
    }

    const studentId = session.user.id;

    // Get the exam attempt
    const [attemptResult] = await db.execute(
      `SELECT a.*, e.title as examTitle, c.name as courseName, c.code as courseCode
       FROM exam_attempts a
       JOIN exams e ON a.examId = e.id
       JOIN courses c ON e.courseId = c.id
       WHERE a.id = ? AND a.studentId = ?`,
      [attemptId, studentId]
    );

    const attempt = (attemptResult as any[])[0];
    if (!attempt) {
      return NextResponse.json(
        { message: "Attempt not found" },
        { status: 404 }
      );
    }

    // Get student answers with question details
    const [answersResult] = await db.execute(
      `SELECT 
        sa.id,
        sa.questionId,
        sa.selectedOption,
        sa.isCorrect,
        q.questionText,
        q.optionA,
        q.optionB,
        q.optionC,
        q.optionD,
        q.correctOption,
        q.marks
       FROM student_answers sa
       JOIN questions q ON sa.questionId = q.id
       WHERE sa.attemptId = ?
       ORDER BY q.id`,
      [attemptId]
    );

    return NextResponse.json({
      attempt,
      answers: answersResult,
    });
  } catch (error) {
    console.error("Error fetching attempt details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
