import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '../db';
import { AuthError } from '../middleware/guard';

export interface ResourceItem {
  id: string;
  institution_id: string;
  branch_id: string;
  branch_name?: string;
  branch_code?: string;
  course_id: string;
  course_name?: string;
  course_code?: string;
  title: string;
  type: 'file' | 'link';
  description: string;
  url: string;
  file_path: string | null;
  file_size: string | null;
  file_name: string | null;
  file_data?: Buffer | Uint8Array | null;
  uploader_id: string;
  uploader_name: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceFilters {
  branchId?: string;
  courseId?: string;
  type?: 'file' | 'link' | 'all';
  query?: string;
}

export interface CreateResourceInput {
  institutionId: string;
  branchId: string;
  courseId: string;
  title: string;
  type: 'file' | 'link';
  description: string;
  url: string;
  filePath?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  fileData?: Buffer | Uint8Array | null;
  uploaderId: string;
  uploaderName: string;
}

export class ResourceService {
  static getResources(institutionId: string, filters: ResourceFilters = {}): ResourceItem[] {
    const db = getDb();

    let sql = `
      SELECT 
        r.*,
        b.name as branch_name,
        b.code as branch_code,
        c.name as course_name,
        c.code as course_code
      FROM resources r
      JOIN branches b ON r.branch_id = b.id
      JOIN courses c ON r.course_id = c.id
      WHERE r.institution_id = ?
    `;

    const params: any[] = [institutionId];

    if (filters.branchId && filters.branchId !== 'all') {
      sql += ' AND r.branch_id = ?';
      params.push(filters.branchId);
    }

    if (filters.courseId && filters.courseId !== 'all') {
      sql += ' AND r.course_id = ?';
      params.push(filters.courseId);
    }

    if (filters.type && filters.type !== 'all') {
      sql += ' AND r.type = ?';
      params.push(filters.type);
    }

    if (filters.query && filters.query.trim()) {
      const q = `%${filters.query.trim()}%`;
      sql += ` AND (
        r.title LIKE ? OR 
        r.description LIKE ? OR 
        c.name LIKE ? OR 
        c.code LIKE ? OR 
        b.name LIKE ?
      )`;
      params.push(q, q, q, q, q);
    }

    sql += ' ORDER BY r.created_at DESC';

    return db.prepare(sql).all(...params) as unknown as ResourceItem[];
  }

  static getResourceById(id: string, userInstitutionId: string): ResourceItem {
    const db = getDb();
    const resource = db
      .prepare(`
        SELECT 
          r.*,
          b.name as branch_name,
          b.code as branch_code,
          c.name as course_name,
          c.code as course_code
        FROM resources r
        JOIN branches b ON r.branch_id = b.id
        JOIN courses c ON r.course_id = c.id
        WHERE r.id = ?
      `)
      .get(id) as unknown as ResourceItem | undefined;

    if (!resource) {
      throw new AuthError('Resource not found', 404);
    }

    // STRICT CROSS-COLLEGE ACCESS CONTROL (Requirement #4)
    if (resource.institution_id !== userInstitutionId) {
      throw new AuthError(
        'Cross-college access forbidden. This resource belongs to another institution.',
        403
      );
    }

    return resource;
  }

  static createResource(data: CreateResourceInput): ResourceItem {
    const db = getDb();

    // 1. Validate branch and course belong to this institution
    const course = db
      .prepare('SELECT id FROM courses WHERE id = ? AND branch_id = ? AND institution_id = ?')
      .get(data.courseId, data.branchId, data.institutionId);

    if (!course) {
      throw new Error('Course does not belong to the selected branch and institution.');
    }

    // 2. Validate Link if type === 'link'
    if (data.type === 'link') {
      try {
        const parsed = new URL(data.url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          throw new Error('Invalid URL protocol. Only HTTP and HTTPS links are allowed.');
        }
      } catch {
        throw new Error('Please provide a valid URL for this resource link.');
      }
    }

    const id = `res-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO resources (
        id, institution_id, branch_id, course_id, title, type, description,
        url, file_path, file_size, file_name, file_data, uploader_id, uploader_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.institutionId,
      data.branchId,
      data.courseId,
      data.title.trim(),
      data.type,
      data.description.trim(),
      data.url.trim(),
      data.filePath || null,
      data.fileSize || null,
      data.fileName || null,
      data.fileData || null,
      data.uploaderId,
      data.uploaderName,
      now,
      now
    );

    return this.getResourceById(id, data.institutionId);
  }

  static updateResource(
    id: string,
    institutionId: string,
    data: { title: string; description: string; url?: string }
  ): ResourceItem {
    const existing = this.getResourceById(id, institutionId);

    const db = getDb();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE resources
      SET title = ?, description = ?, url = COALESCE(?, url), updated_at = ?
      WHERE id = ? AND institution_id = ?
    `).run(
      data.title.trim(),
      data.description.trim(),
      data.url ? data.url.trim() : null,
      now,
      id,
      institutionId
    );

    return this.getResourceById(id, institutionId);
  }

  static deleteResource(id: string, institutionId: string): boolean {
    const resource = this.getResourceById(id, institutionId);

    const db = getDb();

    // If it's a file, remove it from disk
    if (resource.file_path) {
      const fullPath = path.resolve(process.cwd(), resource.file_path);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.warn('Failed to delete file from storage:', fullPath);
        }
      }
    }

    db.prepare('DELETE FROM resources WHERE id = ? AND institution_id = ?').run(id, institutionId);
    return true;
  }
}
