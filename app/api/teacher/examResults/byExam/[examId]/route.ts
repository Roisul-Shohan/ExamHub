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

    // Verify exam belongs to a course owned by this teacher
    const [examResult] = await db.execute(
      `SELECT e.*, c.name as courseName, c.teacherId 
       FROM exams e 
       JOIN courses c ON e.courseId = c.id 
       WHERE e.id = ? AND c.teacherId = ?`,
      [examId, session.user.id]
    );

    if (!(examResult as any[]).length) {
      return NextResponse.json({ error: "Exam not found or not owned by you" }, { status: 404 });
    }

    const exam = (examResult as any[])[0];

    // Get all attempts for this exam with student details
    const [attempts] = await db.execute(
      `SELECT 
        ea.id as attemptId,
        ea.examId,
        ea.studentId,
        ea.score,
        ea.totalMarks as attemptTotalMarks,
        ea.status,
        ea.startTime,
        ea.endTime,
        u.name as studentName,
        u.email as studentEmail
      FROM exam_attempts ea
      JOIN users u ON ea.studentId = u.id
      WHERE ea.examId = ?
      ORDER BY ea.score DESC`,
      [examId]
    );

    // Get all questions for this exam to calculate correct/wrong/unanswered
    const [questions] = await db.execute(
      "SELECT id, correctOption, marks FROM questions WHERE examId = ?",
      [examId]
    );

    // Get student answers for all attempts
    const [studentAnswers] = await db.execute(
      `SELECT sa.attemptId, sa.questionId, sa.selectedOption, sa.isCorrect, q.correctOption
       FROM student_answers sa
       JOIN questions q ON sa.questionId = q.id
       WHERE q.examId = ?`,
      [examId]
    );

    // Organize answers by attemptId
    const answersByAttempt: Record<number, any[]> = {};
    for (const answer of studentAnswers as any[]) {
      if (!answersByAttempt[answer.attemptId]) {
        answersByAttempt[answer.attemptId] = [];
      }
      answersByAttempt[answer.attemptId].push(answer);
    }

    // Calculate stats for each attempt
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
