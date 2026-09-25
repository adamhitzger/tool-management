import { Pool } from "pg";

// Pool přežívá HMR v devu, jinak by každý reload modulu otevřel nový pool.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    // Když se pool zase někdy vyčerpá, request spadne s chybou místo
    // nekonečného čekání.
    connectionTimeoutMillis: 5_000,
  });

pool.on("error", err => {
  console.error("Neočekávaná chyba nečinného klienta v pg poolu:", err);
});

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;
