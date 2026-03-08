import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
 
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { name, code, description } = await req.json();
    
    if (!name || !code) {
      return NextResponse.json(
        { message: "name and course code are required" },
        { status: 400 }
      );
    }

    const [existing] = await db.query(
      "SELECT id FROM courses WHERE code = ?",
      [code]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { message: "Course code already exists" },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO courses (name, code, description,teacherId)
       VALUES (?, ?, ?, ?)`,
      [name, code, description, session.user.id]
    );

    return NextResponse.json(
      { message: "Course created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const [rows] = await db.query(
      "SELECT id, name, code, description, createdat FROM courses WHERE teacherId = ? ORDER BY createdat DESC",
      [session.user.id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
