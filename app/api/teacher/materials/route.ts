import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/teacher/materials?courseId=X — list materials for a course
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = parseInt(searchParams.get('courseId') || '0');
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

  // Verify teacher owns this course
  const [rows] = await db.query(
    'SELECT id FROM courses WHERE id = ? AND teacherId = ?',
    [courseId, parseInt(session.user.id as string)]
  ) as [{ id: number }[], unknown];

  if (!rows.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [materials] = await db.query(
    'SELECT id, title, fileUrl, type, createdAt FROM materials WHERE courseId = ? ORDER BY createdAt DESC',
    [courseId]
  ) as [{ id: number; title: string; fileUrl: string; type: string; createdAt: string }[], unknown];

  return NextResponse.json(materials);
}

// POST /api/teacher/materials — upload a PDF material
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string;
  const courseId = parseInt(formData.get('courseId') as string);
  const type = (formData.get('type') as string) || 'OTHER';

  if (!file || !title || !courseId) {
    return NextResponse.json({ error: 'file, title, and courseId are required' }, { status: 400 });
  }

  // Verify teacher owns this course
  const [rows] = await db.query(
    'SELECT id FROM courses WHERE id = ? AND teacherId = ?',
    [courseId, parseInt(session.user.id as string)]
  ) as [{ id: number }[], unknown];

  if (!rows.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Save file to public/uploads/materials/
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'materials');
  await mkdir(uploadsDir, { recursive: true });

  const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const filePath = path.join(uploadsDir, safeFileName);
  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/materials/${safeFileName}`;

  await db.query(
    'INSERT INTO materials (courseId, uploadedBy, title, fileUrl, type) VALUES (?, ?, ?, ?, ?)',
    [courseId, parseInt(session.user.id as string), title, fileUrl, type]
  );

  return NextResponse.json({ message: 'Material uploaded successfully', fileUrl });
}
