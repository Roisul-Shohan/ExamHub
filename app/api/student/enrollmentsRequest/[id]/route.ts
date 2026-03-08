import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const requestId = parseInt(resolvedParams.id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { message: "Invalid request ID" },
        { status: 400 }
      );
    }

    const studentId = session.user.id;

    // Verify the request belongs to this student
    const [enrollment] = await db.execute(
      "SELECT id FROM course_enrollments WHERE id = ? AND studentId = ? AND status = 'PENDING'",
      [requestId, studentId]
    );

    if (!(enrollment as any[]).length) {
      return NextResponse.json(
        { message: "Enrollment request not found or already processed" },
        { status: 404 }
      );
    }

    // Delete the enrollment request
    await db.execute(
      "DELETE FROM course_enrollments WHERE id = ?",
      [requestId]
    );

    return NextResponse.json(
      { message: "Request cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling enrollment request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
