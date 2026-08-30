import { Pool, type PoolConfig, type QueryResultRow } from "pg";

export interface QueryExecutor {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<readonly T[]>;
}

export interface Database extends QueryExecutor {
  ping(): Promise<void>;
  transaction<T>(work: (tx: QueryExecutor) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface DatabaseOptions {
  ssl?: boolean;
  maxConnections?: number;
}

export function createDatabase(connectionString: string, options: DatabaseOptions = {}): Database {
  const config: PoolConfig = {
    connectionString,
    max: options.maxConnections ?? 10,
    min: 0,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    allowExitOnIdle: false,
    ...(options.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
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
    async transaction<T>(work: (tx: QueryExecutor) => Promise<T>): Promise<T> {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const tx: QueryExecutor = {
          async query<R extends QueryResultRow = QueryResultRow>(
            text: string,
            values: readonly unknown[] = [],
          ) {
            const result = await client.query<R>(text, [...values]);
            return result.rows;
          },
        };
        const result = await work(tx);
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
}
