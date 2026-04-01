// ─── Dummy data matching the database schema ───

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface Course {
  id: number;
  code: string;
  teacherId: number;
  teacherName: string;
  name: string;
  description: string;
  students: number;
  enrollmentStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export interface Exam {
  id: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  title: string;
  description: string;
  examDate: string;
  totalMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  negativeMark: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

export interface Question {
  id: number;
  examId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
}

export interface ExamAttempt {
  id: number;
  examId: number;
  studentId: number;
  startTime: string;
  endTime: string;
  score: number;
  totalMarks: number;
  status: 'STARTED' | 'SUBMITTED' | 'AUTO_SUBMITTED';
}

export interface StudentViewExamsModalProps {
  courseId: number;
  courseName: string;
  exams?: Exam[];
  examAttempts?: ExamAttempt[];
  onClose: () => void;
  onViewQuestions?: (exam: Exam, attempt: ExamAttempt | undefined) => void;
  onViewResults?: (exam: Exam, attempt: ExamAttempt) => void;
}

export interface StudentViewQuestionsModalProps {
  exam: Exam;
  attempt?: ExamAttempt;
  onClose: () => void;
}

export interface StudentViewResultModalProps {
  exam: Exam;
  attempt: ExamAttempt;
  onClose: () => void;
}

export interface StudentAnswer {
  id: number;
  attemptId: number;
  questionId: number;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
}

// ─── Teachers ───
export const teachers: User[] = [
  { id: 1, name: 'Dr. Arindam Sen', email: 'arindam@edu.com', role: 'TEACHER' },
  { id: 2, name: 'Prof. Sneha Roy', email: 'sneha@edu.com', role: 'TEACHER' },
  { id: 3, name: 'Dr. Rajesh Kumar', email: 'rajesh@edu.com', role: 'TEACHER' },
];

// ─── My Enrolled Courses (APPROVED) ───
export const myCourses: Course[] = [
  {
    id: 1,
    code: 'CS101',
    teacherId: 1,
    teacherName: 'Dr. Arindam Sen',
    name: 'Data Structures & Algorithms',
    description: 'Learn fundamental data structures and algorithmic techniques including arrays, linked lists, trees, graphs, sorting, and dynamic programming.',
    students: 42,
    enrollmentStatus: 'APPROVED',
  },
  {
    id: 2,
    code: 'CS201',
    teacherId: 2,
    teacherName: 'Prof. Sneha Roy',
    name: 'Database Management Systems',
    description: 'Comprehensive study of relational database concepts, SQL, normalization, indexing, transactions, and modern database technologies.',
    students: 38,
    enrollmentStatus: 'APPROVED',
  },
  {
    id: 3,
    code: 'CS301',
    teacherId: 1,
    teacherName: 'Dr. Arindam Sen',
    name: 'Operating Systems',
    description: 'Explore process management, memory management, file systems, concurrency, and system-level programming concepts.',
    students: 35,
    enrollmentStatus: 'APPROVED',
  },
];

// ─── Available Courses (not enrolled or pending) ───
export const availableCourses: Course[] = [
  {
    id: 4,
    code: 'CS401',
    teacherId: 3,
    teacherName: 'Dr. Rajesh Kumar',
    name: 'Machine Learning',
    description: 'Introduction to supervised and unsupervised learning, neural networks, decision trees, SVMs, and real-world ML applications.',
    students: 55,
    enrollmentStatus: null,
  },
  {
    id: 5,
    code: 'CS402',
    teacherId: 2,
    teacherName: 'Prof. Sneha Roy',
    name: 'Computer Networks',
    description: 'Study of network protocols, architectures, TCP/IP, routing algorithms, security, and modern networking technologies.',
    students: 40,
    enrollmentStatus: null,
  },
  {
    id: 6,
    code: 'CS403',
    teacherId: 3,
    teacherName: 'Dr. Rajesh Kumar',
    name: 'Artificial Intelligence',
    description: 'Explore intelligent agents, search algorithms, knowledge representation, planning, and natural language processing.',
    students: 48,
    enrollmentStatus: null,
  },
  {
    id: 7,
    code: 'CS404',
    teacherId: 1,
    teacherName: 'Dr. Arindam Sen',
    name: 'Software Engineering',
    description: 'Software development lifecycle, agile methodologies, design patterns, testing strategies, and project management.',
    students: 30,
    enrollmentStatus: 'PENDING',
  },
];

// ─── Exams for enrolled courses ───
export const exams: Exam[] = [
  // CS101 exams
  {
    id: 1,
    courseId: 1,
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS101',
    title: 'Mid-Term Exam - DSA',
    description: 'Covers arrays, linked lists, stacks, queues, and basic sorting',
    examDate: '2026-01-15',
    totalMarks: 50,
    durationMinutes: 60,
    startTime: '2026-01-15 10:00:00',
    endTime: '2026-01-15 11:00:00',
    negativeMark: 0.25,
    status: 'CLOSED',
  },
  {
    id: 2,
    courseId: 1,
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS101',
    title: 'End-Term Exam - DSA',
    description: 'Covers trees, graphs, DP, and advanced algorithms',
    examDate: '2026-02-20',
    totalMarks: 100,
    durationMinutes: 120,
    startTime: '2026-02-20 09:00:00',
    endTime: '2026-02-20 11:00:00',
    negativeMark: 0.5,
    status: 'PUBLISHED',
  },
  // CS201 exams
  {
    id: 3,
    courseId: 2,
    courseName: 'Database Management Systems',
    courseCode: 'CS201',
    title: 'Quiz 1 - SQL Basics',
    description: 'Basic SQL queries, DDL, DML operations',
    examDate: '2026-01-20',
    totalMarks: 20,
    durationMinutes: 30,
    startTime: '2026-01-20 14:00:00',
    endTime: '2026-01-20 14:30:00',
    negativeMark: 0,
    status: 'CLOSED',
  },
  {
    id: 4,
    courseId: 2,
    courseName: 'Database Management Systems',
    courseCode: 'CS201',
    title: 'Mid-Term Exam - DBMS',
    description: 'Normalization, ER diagrams, relational algebra',
    examDate: '2026-02-15',
    totalMarks: 50,
    durationMinutes: 60,
    startTime: '2026-02-15 10:00:00',
    endTime: '2026-02-15 11:00:00',
    negativeMark: 0.25,
    status: 'PUBLISHED',
  },
  // CS301 exams
  {
    id: 5,
    courseId: 3,
    courseName: 'Operating Systems',
    courseCode: 'CS301',
    title: 'Lab Test 1 - Process Management',
    description: 'Process scheduling, threads, synchronization',
    examDate: '2026-02-25',
    totalMarks: 30,
    durationMinutes: 45,
    startTime: '2026-02-25 11:00:00',
    endTime: '2026-02-25 11:45:00',
    negativeMark: 0,
    status: 'PUBLISHED',
  },
];

// ─── Questions for exams ───
export const questions: Question[] = [
  // Exam 1 - DSA Mid-Term (CLOSED - already taken)
  { id: 1, examId: 1, questionText: 'What is the time complexity of binary search?', optionA: 'O(n)', optionB: 'O(log n)', optionC: 'O(n log n)', optionD: 'O(1)', correctOption: 'B', marks: 5 },
  { id: 2, examId: 1, questionText: 'Which data structure uses LIFO principle?', optionA: 'Queue', optionB: 'Array', optionC: 'Stack', optionD: 'Linked List', correctOption: 'C', marks: 5 },
  { id: 3, examId: 1, questionText: 'What is the worst-case time complexity of Quick Sort?', optionA: 'O(n log n)', optionB: 'O(n)', optionC: 'O(n²)', optionD: 'O(log n)', correctOption: 'C', marks: 5 },
  { id: 4, examId: 1, questionText: 'Which traversal visits the root node first?', optionA: 'Inorder', optionB: 'Preorder', optionC: 'Postorder', optionD: 'Level order', correctOption: 'B', marks: 5 },
  { id: 5, examId: 1, questionText: 'A complete binary tree with n nodes has height?', optionA: 'O(n)', optionB: 'O(n²)', optionC: 'O(log n)', optionD: 'O(1)', correctOption: 'C', marks: 5 },

  // Exam 3 - SQL Quiz (CLOSED - already taken)
  { id: 6, examId: 3, questionText: 'Which SQL statement is used to extract data from a database?', optionA: 'GET', optionB: 'EXTRACT', optionC: 'SELECT', optionD: 'PULL', correctOption: 'C', marks: 5 },
  { id: 7, examId: 3, questionText: 'Which SQL clause is used to filter rows?', optionA: 'WHERE', optionB: 'HAVING', optionC: 'FILTER', optionD: 'CONDITION', correctOption: 'A', marks: 5 },
  { id: 8, examId: 3, questionText: 'What does DDL stand for?', optionA: 'Data Definition Language', optionB: 'Data Description Language', optionC: 'Database Definition Logic', optionD: 'Data Design Language', correctOption: 'A', marks: 5 },
  { id: 9, examId: 3, questionText: 'Which command is used to remove a table?', optionA: 'DELETE TABLE', optionB: 'REMOVE TABLE', optionC: 'DROP TABLE', optionD: 'DESTROY TABLE', correctOption: 'C', marks: 5 },
];

// ─── Exam Attempts (taken exams) ───
export const examAttempts: ExamAttempt[] = [
  {
    id: 1,
    examId: 1,
    studentId: 10,
    startTime: '2026-01-15 10:00:00',
    endTime: '2026-01-15 10:45:00',
    score: 20,
    totalMarks: 25,
    status: 'SUBMITTED',
  },
  {
    id: 2,
    examId: 3,
    studentId: 10,
    startTime: '2026-01-20 14:00:00',
    endTime: '2026-01-20 14:22:00',
    score: 15,
    totalMarks: 20,
    status: 'SUBMITTED',
  },
];

// ─── Student Answers for taken exams ───
export const studentAnswers: StudentAnswer[] = [
  // Attempt 1 - DSA Mid-Term
  { id: 1, attemptId: 1, questionId: 1, selectedOption: 'B', isCorrect: true },
  { id: 2, attemptId: 1, questionId: 2, selectedOption: 'C', isCorrect: true },
  { id: 3, attemptId: 1, questionId: 3, selectedOption: 'A', isCorrect: false },
  { id: 4, attemptId: 1, questionId: 4, selectedOption: 'B', isCorrect: true },
  { id: 5, attemptId: 1, questionId: 5, selectedOption: 'C', isCorrect: true },

  // Attempt 2 - SQL Quiz
  { id: 6, attemptId: 2, questionId: 6, selectedOption: 'C', isCorrect: true },
  { id: 7, attemptId: 2, questionId: 7, selectedOption: 'A', isCorrect: true },
  { id: 8, attemptId: 2, questionId: 8, selectedOption: 'A', isCorrect: true },
  { id: 9, attemptId: 2, questionId: 9, selectedOption: 'B', isCorrect: false },
];
