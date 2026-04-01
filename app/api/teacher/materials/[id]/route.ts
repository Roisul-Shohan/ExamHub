import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE /api/teacher/materials/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const materialId = parseInt(id);

  // Verify this material belongs to a course owned by this teacher
  const [rows] = await db.query(
    `SELECT m.id, m.fileUrl FROM materials m
     JOIN courses c ON c.id = m.courseId
     WHERE m.id = ? AND c.teacherId = ?`,
    [materialId, parseInt(session.user.id as string)]
  ) as [{ id: number; fileUrl: string }[], unknown];

  if (!rows.length) return NextResponse.json({ error: 'Forbidden or not found' }, { status: 403 });

  // Delete file from disk
  const fileUrl = rows[0].fileUrl;
  if (fileUrl.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', fileUrl);
    try { await unlink(filePath); } catch { /* file might already be gone */ }
  }

  await db.query('DELETE FROM materials WHERE id = ?', [materialId]);

  return NextResponse.json({ message: 'Material deleted' });
}
