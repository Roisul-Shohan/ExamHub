import { db } from "./db";

export async function createUsersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Users table ready!");
}

export async function createCoursesTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      teacherId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Courses table ready!");
}

export async function createCourseEnrollmentsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id SERIAL PRIMARY KEY,
      courseId INT NOT NULL,
      studentId INT NOT NULL,
      status VARCHAR(255) DEFAULT 'PENDING',
      approvedAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Course Enrollments table ready!");
}

export async function createExamsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS exams (
      id SERIAL PRIMARY KEY,
      courseId INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      examDate DATE NOT NULL,
      totalMarks INT NOT NULL,
      durationMinutes INT NOT NULL,
      startTime TIMESTAMP NOT NULL,
      endTime TIMESTAMP NOT NULL,
      negativeMark FLOAT DEFAULT 0,
      status VARCHAR(255) DEFAULT 'DRAFT',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);
  console.log("Exams table ready!");
}

export async function createQuestionsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      examId INT NOT NULL,
      questionText TEXT NOT NULL,
      optionA VARCHAR(255) NOT NULL,
      optionB VARCHAR(255) NOT NULL,
      optionC VARCHAR(255) NOT NULL,
      optionD VARCHAR(255) NOT NULL,
      correctOption VARCHAR(255) NOT NULL,
      marks FLOAT DEFAULT 1,
      FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE
    )
  `);
  console.log("Questions table ready!");
}

export async function createExamAttemptsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id SERIAL PRIMARY KEY,
      examId INT NOT NULL,
      studentId INT NOT NULL,
      startTime TIMESTAMP NOT NULL,
      endTime TIMESTAMP,
      score FLOAT,
      totalMarks FLOAT,
      status VARCHAR(255) DEFAULT 'STARTED',
      FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Exam Attempts table ready!");
}

export async function createStudentAnswersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS student_answers (
      id SERIAL PRIMARY KEY,
      attemptId INT NOT NULL,
      questionId INT NOT NULL,
      selectedOption VARCHAR(255),
      isCorrect BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (attemptId) REFERENCES exam_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);
  console.log("Student Answers table ready!");
}

export async function createMaterialsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id SERIAL PRIMARY KEY,
      courseId INT NOT NULL,
      uploadedBy INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      fileUrl VARCHAR(500) NOT NULL,
      type VARCHAR(255) DEFAULT 'OTHER',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Materials table ready!");
}

export async function createAllTables() {
  await createUsersTable();
  await createCoursesTable();
  await createCourseEnrollmentsTable();
  await createExamsTable();
  await createQuestionsTable();
  await createExamAttemptsTable();
  await createStudentAnswersTable();
  await createMaterialsTable();
  console.log("All tables are ready!");
}
