export type MaterialType = 'NOTES' | 'RANK_PDF' | 'OTHER';

export interface IMaterial {
  id?: number;
  courseId: number;
  uploadedBy: number; // teacher id
  title: string;
  fileUrl: string;
  type?: MaterialType;
  createdAt?: Date;
}
