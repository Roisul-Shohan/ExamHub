export interface IExam {
  id?: number;
  courseId: number;
  title: string;
  description?: string;
  totalMarks: number;
  durationMinutes: number;
  startTime: Date;
  endTime: Date;
  negativeMark?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt?: Date;
  updatedAt?: Date;
}
