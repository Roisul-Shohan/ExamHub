import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/auth';
import { db } from '@/lib/db';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/teacher/materials?courseId=N — list materials for a course
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = parseInt(searchParams.get('courseId') || '0');
  if (!courseId) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 });
  }

  const [rows] = (await db.query(
    'SELECT id FROM courses WHERE id = ? AND teacherId = ?',
    [courseId, parseInt(session.user.id as string)]
  )) as any;

  if (!rows.length) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [materials] = await db.query(
    'SELECT id, title, fileUrl, type, createdAt FROM materials WHERE courseId = ? ORDER BY createdAt DESC',
    [courseId]
  );

  return NextResponse.json(materials);
}

// POST /api/teacher/materials — multipart upload to Cloudinary
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string;
  const courseId = parseInt(formData.get('courseId') as string);
  const type = (formData.get('type') as string) || 'OTHER';

  if (!file || !title || !courseId) {
    return NextResponse.json(
      { error: 'file, title, and courseId are required' },
      { status: 400 }
    );
  }

  const [rows] = (await db.query(
    'SELECT id FROM courses WHERE id = ? AND teacherId = ?',
    [courseId, parseInt(session.user.id as string)]
  )) as any;

  if (!rows.length) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Pick resource type from mime — PDFs/docs/images vs raw
  const isImage = file.type.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw';

  const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `examhub/materials/${courseId}`,
        resource_type: resourceType,
        public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`,
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Upload failed'));
        resolve(result as { secure_url: string });
      }
    );
    stream.end(buffer);
  });

  const fileUrl = uploadResult.secure_url;

  await db.query(
    'INSERT INTO materials (courseId, uploadedBy, title, fileUrl, type) VALUES (?, ?, ?, ?, ?)',
    [courseId, parseInt(session.user.id as string), title, fileUrl, type]
  );

  return NextResponse.json({ message: 'Material uploaded successfully', fileUrl });
}
