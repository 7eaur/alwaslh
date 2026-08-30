import { Pool, type PoolConfig, type QueryResultRow } from "pg";

export interface Database {
  ping(): Promise<void>;
  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<readonly T[]>;
  close(): Promise<void>;
}

export function createDatabase(connectionString: string): Database {
  const config: PoolConfig = {
    connectionString,
    max: 10,
    min: 0,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    allowExitOnIdle: false,
  };
  const pool = new Pool(config);

  return {
    async ping() {
      await pool.query("select 1");
    },
    async query<T extends QueryResultRow = QueryResultRow>(text: string, values: readonly unknown[] = []) {
      const result = await pool.query<T>(text, [...values]);
      return result.rows;
    },
    async close() {
      await pool.end();
    },
  };
}
