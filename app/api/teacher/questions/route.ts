import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json(
        { error: "ExamId is required" },
        { status: 400 }
      );
    }

    const [questions] = await db.execute(
      `SELECT id, examId, questionText, optionA, optionB, optionC, optionD, correctOption, marks
       FROM questions WHERE examId = ? ORDER BY id ASC`,
      [examId]
    );

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Fetch questions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { examId, questions } = body;

    if (!examId || !questions || !questions.length) {
      return NextResponse.json(
        { error: "ExamId and questions are required" },
        { status: 400 }
      );
    }

    for (const q of questions) {
      const { questionText, options, marks } = q;

      if (!questionText || options.length !== 4) {
        continue;
      }

      // Map options to A, B, C, D
      const optionA = options[0].text;
      const optionB = options[1].text;
      const optionC = options[2].text;
      const optionD = options[3].text;

      // Detect correct option
      let correctOption: "A" | "B" | "C" | "D" = "A";

      if (options[0].isCorrect) correctOption = "A";
      else if (options[1].isCorrect) correctOption = "B";
      else if (options[2].isCorrect) correctOption = "C";
      else if (options[3].isCorrect) correctOption = "D";

      await db.execute(
        `INSERT INTO questions 
        (examId, questionText, optionA, optionB, optionC, optionD, correctOption, marks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          examId,
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption,
          marks || 1,
        ]
      );
    }

    return NextResponse.json({ message: "Questions saved successfully" });

  } catch (error) {
    console.error("Save questions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
