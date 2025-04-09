import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

// Create a database pool with one connection
const pool = new Pool(
  {
    tls: { enabled: false },
    database: 'postgres',
    hostname: Deno.env.get('DB_HOSTNAME'),
    user: Deno.env.get('DB_USER'),
    port: 6543,
    password: Deno.env.get('DB_PASSWORD'),
  },
  1
)

export async function withConnection<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await pool.connect()
  try {
    return await callback(connection)
  } finally {
    connection.release()
  }
}

export async function query<T>(
  sql: string,
  params?: any[]
): Promise<{ rows: T[] }> {
  return withConnection(async (connection) => {
    return await connection.queryObject(sql, params)
  })
}

export async function queryOne<T>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(sql, params)
  return result.rows[0] || null
}

export async function execute(
  sql: string,
  params?: any[]
): Promise<{ rowCount: number }> {
  return withConnection(async (connection) => {
    return await connection.queryObject(sql, params)
  })
}

// Helper to safely close the pool when the application is shutting down
export async function closePool() {
  await pool.end()
} 