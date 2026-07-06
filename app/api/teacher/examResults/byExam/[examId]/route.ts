import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const examId = parseInt(resolvedParams.examId);

    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    const [examResult] = await db.execute(
      `SELECT e.*, c.name AS courseName, c.teacherId 
       FROM exams e 
       JOIN courses c ON e.courseId = c.id 
       WHERE e.id = ? AND c.teacherId = ?`,
      [examId, session.user.id]
    );

    if (!(examResult as any[]).length) {
      return NextResponse.json({ error: "Exam not found or not owned by you" }, { status: 404 });
    }

    const exam = (examResult as any[])[0];

    const [attempts] = await db.execute(
      `SELECT 
        ea.id AS attemptId,
        ea.examId,
        ea.studentId,
        ea.score,
        ea.totalMarks AS attemptTotalMarks,
        ea.status,
        ea.startTime,
        ea.endTime,
        u.name AS studentName,
        u.email AS studentEmail
      FROM exam_attempts ea
      JOIN users u ON ea.studentId = u.id
      WHERE ea.examId = ?
      ORDER BY ea.score DESC`,
      [examId]
    );

    const [questions] = await db.execute(
      "SELECT id AS id, correctOption AS correctOption, marks AS marks FROM questions WHERE examId = ?",
      [examId]
    );

    const [studentAnswers] = await db.execute(
      `SELECT sa.attemptId AS attemptId, sa.questionId AS questionId, sa.selectedOption AS selectedOption, sa.isCorrect AS isCorrect, q.correctOption AS correctOption
       FROM student_answers sa
       JOIN questions q ON sa.questionId = q.id
       WHERE q.examId = ?
      `,
      [examId]
    );

    const answersByAttempt: Record<number, any[]> = {};
    for (const answer of studentAnswers as any[]) {
      if (!answersByAttempt[answer.attemptId]) {
        answersByAttempt[answer.attemptId] = [];
      }
      answersByAttempt[answer.attemptId].push(answer);
    }

    const results = (attempts as any[]).map((attempt, index) => {
      const attemptAnswers = answersByAttempt[attempt.attemptId] || [];
      const totalQuestions = (questions as any[]).length;
      const attempted = attemptAnswers.filter((a: any) => a.selectedOption).length;
      const correct = attemptAnswers.filter((a: any) => a.isCorrect).length;
      const wrong = attemptAnswers.filter((a: any) => a.selectedOption && !a.isCorrect).length;
      const unattempted = totalQuestions - attempted;
      const percentage = attempt.attemptTotalMarks > 0 
        ? (attempt.score / attempt.attemptTotalMarks) * 100 
        : 0;

      return {
        id: attempt.attemptId,
        name: attempt.studentName,
        email: attempt.studentEmail,
        score: attempt.score,
        totalMarks: exam.totalMarks,
        percentage: parseFloat(percentage.toFixed(1)),
        rank: index + 1,
        attempted,
        correct,
        wrong,
        unattempted,
        status: attempt.status
      };
    });

    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        totalMarks: exam.totalMarks,
        courseName: exam.courseName
      },
      results
    });
  } catch (error) {
    console.error("Fetch exam results error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
