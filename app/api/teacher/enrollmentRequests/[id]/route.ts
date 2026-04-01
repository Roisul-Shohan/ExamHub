import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// PATCH /api/teacher/enrollmentRequests/[id] — approve or reject a request
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);

    if (isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }

    const { action } = await req.json();

    if (!action || !["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'APPROVED' or 'REJECTED'" },
        { status: 400 }
      );
    }

    // Verify the enrollment request belongs to one of this teacher's courses
    const [enrollment] = await db.execute(
      `SELECT ce.id FROM course_enrollments ce
       JOIN courses c ON ce.courseId = c.id
       WHERE ce.id = ? AND c.teacherId = ? AND ce.status = 'PENDING'`,
      [requestId, session.user.id]
    );

    if (!(enrollment as any[]).length) {
      return NextResponse.json(
        { error: "Enrollment request not found or already processed" },
        { status: 404 }
      );
    }

    if (action === "APPROVED") {
      await db.execute(
        "UPDATE course_enrollments SET status = 'APPROVED', approvedAt = NOW() WHERE id = ?",
        [requestId]
      );
    } else {
      await db.execute(
        "UPDATE course_enrollments SET status = 'REJECTED' WHERE id = ?",
        [requestId]
      );
    }

    return NextResponse.json({
      message: `Request ${action === "APPROVED" ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    console.error("Update enrollment request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
