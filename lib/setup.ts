import { db } from "./db";

// Users table
export async function createUsersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('TEACHER','STUDENT') NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    );
  `);
  console.log("Users table ready!");
}

// Courses table
export async function createCoursesTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT NOT NULL AUTO_INCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      teacherId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log("Courses table ready!");
}

// Course Enrollments
export async function createCourseEnrollmentsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id INT NOT NULL AUTO_INCREMENT,
      courseId INT NOT NULL,
      studentId INT NOT NULL,
      status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
      approvedAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log("Course Enrollments table ready!");
}

// Exams table
export async function createExamsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS exams (
      id INT NOT NULL AUTO_INCREMENT,
      courseId INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      examDate DATE NOT NULL,
      totalMarks INT NOT NULL,
      durationMinutes INT NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME NOT NULL,
      negativeMark FLOAT DEFAULT 0,
      status ENUM('DRAFT','PUBLISHED','CLOSED') DEFAULT 'DRAFT',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);
  console.log("Exams table ready!");
}

// Questions table
export async function createQuestionsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT NOT NULL AUTO_INCREMENT,
      examId INT NOT NULL,
      questionText TEXT NOT NULL,
      optionA VARCHAR(255) NOT NULL,
      optionB VARCHAR(255) NOT NULL,
      optionC VARCHAR(255) NOT NULL,
      optionD VARCHAR(255) NOT NULL,
      correctOption ENUM('A','B','C','D') NOT NULL,
      marks FLOAT DEFAULT 1,
      PRIMARY KEY (id),
      FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE
    );
  `);
  console.log("Questions table ready!");
}

// Exam Attempts
export async function createExamAttemptsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id INT NOT NULL AUTO_INCREMENT,
      examId INT NOT NULL,
      studentId INT NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME,
      score FLOAT,
      totalMarks FLOAT,
      status ENUM('STARTED','SUBMITTED','AUTO_SUBMITTED') DEFAULT 'STARTED',
      PRIMARY KEY (id),
      FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log("Exam Attempts table ready!");
}

// Student Answers
export async function createStudentAnswersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS student_answers (
      id INT NOT NULL AUTO_INCREMENT,
      attemptId INT NOT NULL,
      questionId INT NOT NULL,
      selectedOption ENUM('A','B','C','D') DEFAULT NULL,
      isCorrect BOOLEAN DEFAULT FALSE,
      PRIMARY KEY (id),
      FOREIGN KEY (attemptId) REFERENCES exam_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    );
  `);
  console.log("Student Answers table ready!");
}

// Materials (PDF, Notes, Rank)
export async function createMaterialsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id INT NOT NULL AUTO_INCREMENT,
      courseId INT NOT NULL,
      uploadedBy INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      fileUrl VARCHAR(500) NOT NULL,
      type ENUM('NOTES','RANK_PDF','OTHER') DEFAULT 'OTHER',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log("Materials table ready!");
}

// Run all
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
