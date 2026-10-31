import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { initializeDatabase } from './init';

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const rawPath = process.env.DATABASE_PATH || 'data/app.db';
    const isMemory = rawPath === ':memory:';
    const dbPath = isMemory ? ':memory:' : path.resolve(process.cwd(), rawPath);

    if (!isMemory) {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }

    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA busy_timeout = 5000;');
    if (!isMemory) {
      dbInstance.exec('PRAGMA journal_mode = WAL;');
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
