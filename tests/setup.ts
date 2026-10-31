import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { closeDb, getDb } from '../src/server/db/index';

export function setupTestEnvironment(): { db: DatabaseSync; cleanup: () => void } {
  closeDb();
  const testDbName = `notevault-test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.db`;
  const testDbPath = path.join(os.tmpdir(), testDbName);
  process.env.DATABASE_PATH = testDbPath;
  process.env.ENCRYPTION_KEY = 'test-master-encryption-key-32chars!';
  process.env.JWT_SECRET = 'test-jwt-secret-for-automated-tests-key';
  process.env.GEMINI_MODEL = 'gemini-1.5-flash';
  process.env.OPENAI_MODEL = 'gpt-4o-mini';
  process.env.ANTHROPIC_MODEL = 'claude-3-haiku-20240307';

  const db = getDb();

  const cleanup = () => {
    closeDb();
    try {
      if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
      if (fs.existsSync(`${testDbPath}-wal`)) fs.unlinkSync(`${testDbPath}-wal`);
      if (fs.existsSync(`${testDbPath}-shm`)) fs.unlinkSync(`${testDbPath}-shm`);
    } catch {}
  };

  return { db, cleanup };
}
