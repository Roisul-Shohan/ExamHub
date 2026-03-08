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

    // Get count of questions for this exam
    const [result] = await db.execute(
      'SELECT COUNT(*) as count FROM questions WHERE examId = ?',
      [examId]
    );

    const count = (result as any)[0]?.count || 0;

    return NextResponse.json({ hasQuestions: count > 0, count });
  } catch (error) {
    console.error("Error fetching question count:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
