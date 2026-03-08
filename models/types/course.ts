export interface ICourse {
  id?: number;
  teacherId: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
