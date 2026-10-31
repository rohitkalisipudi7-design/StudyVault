import crypto from 'node:crypto';
import { getDb } from '../db';
import { hashPassword } from '../security/auth';

export interface Institution {
  id: string;
  name: string;
  short_name: string;
  code: string;
  created_at: string;
}

export interface Branch {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Course {
  id: string;
  institution_id: string;
  branch_id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
}

export class InstitutionService {
  static getAllInstitutions(): Institution[] {
    const db = getDb();
    return db.prepare('SELECT * FROM institutions ORDER BY name ASC').all() as unknown as Institution[];
  }

  static getInstitutionById(id: string): Institution | null {
    const db = getDb();
    const result = db.prepare('SELECT * FROM institutions WHERE id = ?').get(id);
    return (result as unknown as Institution) || null;
  }

  static createInstitution(name: string, code: string, shortName?: string): Institution {
    const db = getDb();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanShortName = (shortName || cleanCode).trim().toUpperCase();

    const existing = db.prepare('SELECT * FROM institutions WHERE code = ? OR name = ?').get(cleanCode, cleanName) as any;
    if (existing) {
      return existing;
    }

    const id = `inst-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO institutions (id, name, short_name, code, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, cleanName, cleanShortName, cleanCode, now);

    return {
      id,
      name: cleanName,
      short_name: cleanShortName,
      code: cleanCode,
      created_at: now,
    };
  }

  static registerInstitutionWithAdmin(data: {
    institutionName: string;
    code: string;
    shortName?: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }): { institution: Institution; adminUser: { id: string; email: string; name: string; role: 'admin'; institutionId: string } } {
    const db = getDb();
    const cleanEmail = data.adminEmail.toLowerCase().trim();

    db.exec('BEGIN IMMEDIATE TRANSACTION;');
    try {
      const inst = this.createInstitution(data.institutionName, data.code, data.shortName);
      const { hash, salt } = hashPassword(data.adminPassword);
      const userId = `user-${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO users (id, institution_id, name, email, password_hash, password_salt, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'admin', ?)
      `).run(userId, inst.id, data.adminName.trim(), cleanEmail, hash, salt, now);

      db.exec('COMMIT;');
      return {
        institution: inst,
        adminUser: {
          id: userId,
          email: cleanEmail,
          name: data.adminName.trim(),
          role: 'admin',
          institutionId: inst.id,
        },
      };
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }

  static getBranches(institutionId: string): Branch[] {
    const db = getDb();
    return db
      .prepare('SELECT * FROM branches WHERE institution_id = ? ORDER BY name ASC')
      .all(institutionId) as unknown as Branch[];
  }

  static createBranch(institutionId: string, name: string, code: string): Branch {
    const db = getDb();
    const id = `branch-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO branches (id, institution_id, name, code, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, institutionId, name.trim(), code.trim().toUpperCase(), now);

    return {
      id,
      institution_id: institutionId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      created_at: now,
    };
  }

  static getCourses(institutionId: string, branchId?: string): Course[] {
    const db = getDb();
    if (branchId) {
      return db
        .prepare('SELECT * FROM courses WHERE institution_id = ? AND branch_id = ? ORDER BY code ASC')
        .all(institutionId, branchId) as unknown as Course[];
    }
    return db
      .prepare('SELECT * FROM courses WHERE institution_id = ? ORDER BY code ASC')
      .all(institutionId) as unknown as Course[];
  }

  static createCourse(
    institutionId: string,
    branchId: string,
    name: string,
    code: string,
    description: string = ''
  ): Course {
    const db = getDb();
    const id = `course-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // Verify branch belongs to same institution
    const branch = db.prepare('SELECT * FROM branches WHERE id = ? AND institution_id = ?').get(branchId, institutionId);
    if (!branch) {
      throw new Error('Branch not found in this institution');
    }

    db.prepare(`
      INSERT INTO courses (id, institution_id, branch_id, name, code, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, institutionId, branchId, name.trim(), code.trim().toUpperCase(), description.trim(), now);

    return {
      id,
      institution_id: institutionId,
      branch_id: branchId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      created_at: now,
    };
  }
}
