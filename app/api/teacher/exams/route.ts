import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();

    const {
      courseId,
      title,
      description,
      examDate,
      startTime,
      endTime,
      totalMarks,
      durationMinutes,
      negativeMark,
      status,
    } = body;

    if (
      !courseId ||
      !title ||
      !examDate ||
      !startTime ||
      !endTime ||
      !totalMarks ||
      !durationMinutes
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure proper datetime format for MySQL
    const formatDateTime = (dt: string | null | undefined) => {
      if (!dt) return null;
      
      // If already in correct format YYYY-MM-DD HH:MM:SS, return as is
      if (dt.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return dt;
      }
      
      // If ISO format with T
      if (dt.includes('T')) {
        const [datePart, timePart] = dt.split('T');
        return `${datePart} ${timePart.substring(0, 5)}:00`;
      }
      
      return dt;
    };

    const formattedStartTime = formatDateTime(startTime);
    const formattedEndTime = formatDateTime(endTime);

    console.log('Inserting exam:', {
      courseId,
      title,
      examDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      totalMarks,
      durationMinutes,
    });

    const [result] = await db.execute(
      `INSERT INTO exams 
      (courseId, title, description, examDate, startTime, endTime, totalMarks, durationMinutes, negativeMark, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        title,
        description || null,
        examDate,
        formattedStartTime,
        formattedEndTime,
        totalMarks,
        durationMinutes,
        negativeMark || 0,
        status || "DRAFT",
      ]
    );

    return NextResponse.json({
      message: "Exam created successfully",
      examId: (result as any).insertId,
    });

  } catch (error) {
    console.error("Create Exam Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
