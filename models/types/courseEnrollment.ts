export interface ICourseEnrollment {
  id?: number;
  courseId: number;
  studentId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: Date;
  createdAt?: Date;
}
