import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // load .env or .env.local

// Type for database configuration
interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Load config from environment variables
const config: DbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Online_Examination_System",
};

// Create a connection pool
export const db = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  
});

// Optional helper function for testing connection
export const testDbConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
};
