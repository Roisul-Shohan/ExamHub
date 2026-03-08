import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
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
      "SELECT id FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, session.user.id]
    );

    if (!(course as any[]).length) {
      return NextResponse.json(
        { error: "Course not found or not owned by you" },
        { status: 404 }
      );
    }

    const [students] = await db.execute(
      `SELECT u.id, u.name, u.email,e.status
       FROM course_enrollments e
       JOIN users u ON e.studentId = u.id
       WHERE e.courseId = ? AND u.role = 'STUDENT'`,
      [courseId]
    );

    return NextResponse.json(students);

  } catch (error) {
    console.error("Fetch students error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const body = await req.json();
    const { studentId, action } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // Verify course belongs to teacher
    const [course] = await db.execute(
      "SELECT id FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, session.user.id]
    );

    if (!(course as any[]).length) {
      return NextResponse.json(
        { error: "Course not found or not owned by you" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      await db.execute(
        "UPDATE course_enrollments SET status = 'APPROVED' WHERE courseId = ? AND studentId = ?",
        [courseId, studentId]
      );
      
      return NextResponse.json({ message: "Student approved successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Approve student error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
