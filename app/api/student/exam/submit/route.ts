import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { examId, answers, isAutoSubmit } = body;

    if (!examId || !answers) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const studentId = session.user.id;

    // Verify student is enrolled in this exam's course
    const [enrollment] = await db.execute(
      `SELECT e.id FROM course_enrollments e
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

    // Check if exam exists and is published
    const [examResult] = await db.execute(
      `SELECT * FROM exams WHERE id = ? AND status = 'PUBLISHED'`,
      [examId]
    );

    const exam = (examResult as any[])[0];
    if (!exam) {
      return NextResponse.json(
        { message: "Exam not found or not available" },
        { status: 404 }
      );
    }

    // Check if student already attempted this exam
    const [existingAttempt] = await db.execute(
      `SELECT id FROM exam_attempts WHERE examId = ? AND studentId = ?`,
      [examId, studentId]
    );

    if ((existingAttempt as any[]).length > 0) {
      return NextResponse.json(
        { message: "You have already attempted this exam" },
        { status: 400 }
      );
    }

    // Get all questions for the exam
    const [questionsResult] = await db.execute(
      `SELECT id, correctOption, marks FROM questions WHERE examId = ?`,
      [examId]
    );

    const questions = questionsResult as any[];
    
    // Calculate score
    let score = 0;
    let totalMarks = 0;
    const studentAnswers: Array<{
      questionId: number;
      selectedOption: string | null;
      isCorrect: boolean;
    }> = [];

    for (const question of questions) {
      totalMarks += question.marks;
      const selectedOption = answers[question.id];
      
      if (selectedOption) {
        const isCorrect = selectedOption === question.correctOption;
        studentAnswers.push({
          questionId: question.id,
          selectedOption,
          isCorrect,
        });

        if (isCorrect) {
          score += question.marks;
        } else if (exam.negativeMark > 0) {
          // Apply negative marking - fixed value per wrong answer
          score -= exam.negativeMark;
        }
      } else {
        // Unanswered question
        studentAnswers.push({
          questionId: question.id,
          selectedOption: null,
          isCorrect: false,
        });
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Create exam attempt
    const [attemptResult] = await db.execute(
      `INSERT INTO exam_attempts (examId, studentId, startTime, endTime, score, totalMarks, status)
       VALUES (?, ?, NOW(), NOW(), ?, ?, ?)`,
      [examId, studentId, score, totalMarks, isAutoSubmit ? 'AUTO_SUBMITTED' : 'SUBMITTED']
    );

    const attemptId = (attemptResult as any).insertId;

    // Save student answers
    for (const answer of studentAnswers) {
      await db.execute(
        `INSERT INTO student_answers (attemptId, questionId, selectedOption, isCorrect)
         VALUES (?, ?, ?, ?)`,
        [attemptId, answer.questionId, answer.selectedOption, answer.isCorrect]
      );
    }

    // Get the created attempt to return
    const [newAttemptResult] = await db.execute(
      `SELECT id, examId, studentId, startTime, endTime, score, totalMarks, status 
       FROM exam_attempts WHERE id = ?`,
      [attemptId]
    );

    const newAttempt = (newAttemptResult as any[])[0];

    return NextResponse.json({
      message: "Exam submitted successfully",
      attempt: {
        id: newAttempt.id,
        examId: newAttempt.examId,
        studentId: newAttempt.studentId,
        startTime: newAttempt.startTime,
        endTime: newAttempt.endTime,
        score: newAttempt.score,
        totalMarks: newAttempt.totalMarks,
        status: newAttempt.status,
      },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
