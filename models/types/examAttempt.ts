export interface IExamAttempt {
  id?: number;
  examId: number;
  studentId: number;
  startTime: Date;
  endTime?: Date;
  score?: number;
  status?: 'STARTED' | 'SUBMITTED' | 'AUTO_SUBMITTED';
}
