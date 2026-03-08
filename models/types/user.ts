export type Role = 'TEACHER' | 'STUDENT';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
