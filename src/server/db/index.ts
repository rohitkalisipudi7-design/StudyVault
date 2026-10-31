import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { initializeDatabase } from './init';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'app.db');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    initSchema(dbInstance);
  }
  return dbInstance;
}

export function initSchema(db: DatabaseSync) {
  initializeDatabase(db);
}

export { initializeDatabase };
