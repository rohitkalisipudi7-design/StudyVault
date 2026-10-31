import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { initializeDatabase } from './init';

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    let rawPath = process.env.DATABASE_PATH;
    if (!rawPath) {
      if (process.env.VERCEL) {
        rawPath = path.join(os.tmpdir(), 'app.db');
      } else {
        rawPath = 'data/app.db';
      }
    }

    const isMemory = rawPath === ':memory:';
    const dbPath = isMemory ? ':memory:' : path.resolve(process.cwd(), rawPath);

    if (!isMemory) {
      // In Vercel serverless environment, copy pre-seeded database to /tmp if available
      if (process.env.VERCEL && dbPath.includes(os.tmpdir())) {
        const bundledDb = path.resolve(process.cwd(), 'data', 'app.db');
        if (!fs.existsSync(dbPath) && fs.existsSync(bundledDb)) {
          try {
            fs.copyFileSync(bundledDb, dbPath);
          } catch {}
        }
      }

      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        try {
          fs.mkdirSync(dbDir, { recursive: true });
        } catch {}
      }
    }

    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA busy_timeout = 5000;');
    if (!isMemory) {
      try {
        dbInstance.exec('PRAGMA journal_mode = WAL;');
      } catch {
        // Non-blocking fallback
      }
    }
    initSchema(dbInstance);
  }
  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {}
    dbInstance = null;
  }
}

export function setDbInstance(db: DatabaseSync | null): void {
  dbInstance = db;
}

export function initSchema(db: DatabaseSync) {
  initializeDatabase(db);
}

export { initializeDatabase };
