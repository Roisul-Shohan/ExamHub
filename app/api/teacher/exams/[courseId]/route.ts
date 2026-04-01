import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; 
import { db } from "@/lib/db"; 

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params; 
    const courseId = parseInt(resolvedParams.courseId);


    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const [course] = await db.execute(
      "SELECT * FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, session.user.id]
    );

    if (!(course as any[]).length) {
      return NextResponse.json({ error: "Course not found or not owned by you" }, { status: 404 });
    }

  
    const [exams] = await db.execute(
      "SELECT id, title, description, totalMarks, durationMinutes, startTime, endTime, negativeMark, status, examDate FROM exams WHERE courseId = ? ORDER BY startTime DESC",
      [courseId]
    );

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Fetch exams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.courseId);

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    // Verify course belongs to teacher
    const [course] = await db.execute(
      "SELECT * FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, session.user.id]
    );

    if (!(course as any[]).length) {
      return NextResponse.json({ error: "Course not found or not owned by you" }, { status: 404 });
    }

    const body = await req.json();
    const { examId, status, title, description, examDate, startTime, endTime, totalMarks, durationMinutes, negativeMark } = body;

    // If only status is being updated
    if (examId && status && !title) {
      if (!['DRAFT', 'PUBLISHED', 'CLOSED'].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      // Verify exam belongs to this course
      const [exam] = await db.execute(
        "SELECT id FROM exams WHERE id = ? AND courseId = ?",
        [examId, courseId]
      );

      if (!(exam as any[]).length) {
        return NextResponse.json({ error: "Exam not found in this course" }, { status: 404 });
      }

      // Update exam status
      await db.execute(
        "UPDATE exams SET status = ? WHERE id = ?",
        [status, examId]
      );

      return NextResponse.json({ message: "Exam status updated successfully" });
    }

    // Full exam update
    if (examId && title) {
      // Verify exam belongs to this course
      const [exam] = await db.execute(
        "SELECT id FROM exams WHERE id = ? AND courseId = ?",
        [examId, courseId]
      );

      if (!(exam as any[]).length) {
        return NextResponse.json({ error: "Exam not found in this course" }, { status: 404 });
      }

      // Build update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (title) {
        updateFields.push("title = ?");
        updateValues.push(title);
      }
      if (description !== undefined) {
        updateFields.push("description = ?");
        updateValues.push(description);
      }
      if (examDate) {
        updateFields.push("examDate = ?");
        updateValues.push(examDate);
      }
      if (startTime) {
        updateFields.push("startTime = ?");
        updateValues.push(startTime);
      }
      if (endTime) {
        updateFields.push("endTime = ?");
        updateValues.push(endTime);
      }
      if (totalMarks) {
        updateFields.push("totalMarks = ?");
        updateValues.push(totalMarks);
      }
      if (durationMinutes) {
        updateFields.push("durationMinutes = ?");
        updateValues.push(durationMinutes);
      }
      if (negativeMark !== undefined) {
        updateFields.push("negativeMark = ?");
        updateValues.push(negativeMark);
      }
      if (status) {
        if (!['DRAFT', 'PUBLISHED', 'CLOSED'].includes(status)) {
          return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        updateFields.push("status = ?");
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateValues.push(examId);
        await db.execute(
          `UPDATE exams SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      return NextResponse.json({ message: "Exam updated successfully" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Update exam error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
