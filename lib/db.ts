import postgres, { type Sql } from "postgres";

// Lazy-init so `next build` doesn't fail on hosts without a DB available
// at build time. The client is created on first query/execute.
let rawDb: ReturnType<typeof postgres> | null = null;

function getRawDb() {
  if (rawDb) return rawDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Set it in .env.local (local) or in Vercel project settings."
    );
  }

  // Detect a pooled connection (Supabase / Neon pgbouncer) so we keep
  // `max: 1` per serverless function while letting the pooler multiplex.
  const isPooled = /pgbouncer|pooler|supabase\.com|neon\.tech/i.test(connectionString);

  rawDb = postgres(connectionString, {
    max: 1,
    ssl:
      connectionString.includes("sslmode=require") ||
      !connectionString.includes("localhost")
        ? "require"
        : false,
    idle_timeout: isPooled ? 30 : 20,
    connect_timeout: 10,
  });

  return rawDb;
}

type Row = Record<string, any>;

/**
 * postgres-js lowercases every unquoted identifier, so columns created as
 * camelCase (e.g. `courseId`) come back as `courseid`. This helper rewrites
 * every key in a row to camelCase so route handlers can keep using
 * `row.courseId` etc. without quoting identifiers in SQL.
 */
// Suffixes that mark a word boundary in our schema's lowercased identifiers
// (postgres-js lowercases unquoted aliases, so `courseId` comes back as
// `courseid` with no separator to recover the camelCase boundary).
const SUFFIXES = [
  "description", "createdat", "updatedat",
  "name", "code", "email", "status",
  "id", "url", "key",
];

function toCamel(s: string): string {
  const lower = s.toLowerCase();

  // Already snake_case → straight camelCase.
  if (lower.includes("_")) {
    return lower.replace(/_([a-z0-9])/g, (_, ch) => ch.toUpperCase());
  }

  // Already camelCase (e.g. preserved by an explicit `AS "courseId"` alias).
  if (/[A-Z]/.test(s[0]) || /[a-z0-9][A-Z]/.test(s)) {
    return s;
  }

  // Lowercased camelCase smashed together (`courseid`, `coursename`,
  // `studentid`). Try to recover the boundary by matching known suffixes.
  for (const suf of SUFFIXES) {
    if (lower.endsWith(suf) && lower.length > suf.length) {
      const head = lower.slice(0, lower.length - suf.length);
      return head + suf.charAt(0).toUpperCase() + suf.slice(1);
    }
  }

  return lower;
}

function camelCaseKeys<T extends Record<string, any>>(row: T): T {
  const out: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    out[toCamel(key)] = row[key];
  }
  return out as T;
}

async function mysqlQuery<T extends Row = Row>(rawSql: string, params: any[] = []): Promise<[T[], any]> {
  const rows = (await _internalQuery(rawSql, params)).map(camelCaseKeys) as T[];
  return [rows, null];
}

async function mysqlExecute<T extends Row = Row>(rawSql: string, params: any[] = []): Promise<[T[], any]> {
  return mysqlQuery<T>(rawSql, params);
}

async function _internalQuery(rawSql: string, params: any[] = []): Promise<Row[]> {
  const client = getRawDb();

  if (params.length === 0) {
    return (await client.unsafe(rawSql)) as unknown as Row[];
  }

  let sql = rawSql;
  let idx = 1;
  sql = sql.replace(/\?/g, () => `$${idx++}`);
  return (await client.unsafe(sql, params)) as unknown as Row[];
}

const db = {} as Sql<{}> & {
  query: <T = any>(sql: string, params?: any[]) => Promise<[T[], any]>;
  execute: <T = any>(sql: string, params?: any[]) => Promise<[T[], any]>;
};

Object.defineProperty(db, 'query', {
  value: mysqlQuery,
  enumerable: false,
  writable: false,
});
Object.defineProperty(db, 'execute', {
  value: mysqlExecute,
  enumerable: false,
  writable: false,
});

export { db, mysqlQuery as query, mysqlExecute as execute, _internalQuery as internalQuery };

export async function testDbConnection() {
  try {
    await getRawDb()`SELECT 1`;
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}
