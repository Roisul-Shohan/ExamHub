import { createAllTables } from "@/lib/setup";

async function main() {
  try {
    await createAllTables();
    console.log("✅ Database initialized successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    process.exit(1);
  }
}

main();
