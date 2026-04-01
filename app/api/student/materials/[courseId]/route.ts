import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET /api/student/materials/[courseId] — fetch materials for an enrolled course
export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { courseId } = await params;
  const cId = parseInt(courseId);

  // Verify student is approved-enrolled in this course
  const [enrollment] = await db.query(
    `SELECT id FROM course_enrollments WHERE courseId = ? AND studentId = ? AND status = 'APPROVED'`,
    [cId, parseInt(session.user.id as string)]
  ) as [{ id: number }[], unknown];

  if (!enrollment.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [materials] = await db.query(
    'SELECT id, title, fileUrl, type, createdAt FROM materials WHERE courseId = ? ORDER BY createdAt DESC',
    [cId]
  ) as [{ id: number; title: string; fileUrl: string; type: string; createdAt: string }[], unknown];

  return NextResponse.json(materials);
}
