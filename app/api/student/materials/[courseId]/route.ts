import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { courseId } = await params;
  const cId = parseInt(courseId);

  const [enrollment] = await db.query(
    `SELECT id FROM course_enrollments WHERE courseId = ? AND studentId = ? AND status = 'APPROVED'`,
    [cId, parseInt(session.user.id as string)]
  ) as any[];

  if (!enrollment.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [materials] = await db.query(
    'SELECT id AS id, title AS title, fileUrl AS fileUrl, type AS type, createdAt AS createdAt FROM materials WHERE courseId = ? ORDER BY createdAt DESC',
    [cId]
  );

  return NextResponse.json(materials);
}
