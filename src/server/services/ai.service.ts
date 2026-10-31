import crypto from 'node:crypto';
import { getDb } from '../db';
import { encryptApiKey, decryptApiKey } from '../security/encryption';
import { getAIProvider } from '../ai/factory';
import { AIProviderType, ScopedResourceContext, AISearchResult, AISummaryResult, AISuggestionResult } from '../ai/types';
import { ResourceService } from './resource.service';

export interface UserApiKeyConfig {
  configured: boolean;
  provider: AIProviderType | null;
  keyHint: string | null;
  updatedAt?: string;
}

export class AIService {
  static getUserApiKeyConfig(userId: string): UserApiKeyConfig {
    const db = getDb();
    const row = db
      .prepare('SELECT provider, key_hint, updated_at FROM user_api_keys WHERE user_id = ?')
      .get(userId) as any;

    if (!row) {
      return {
        configured: false,
        provider: null,
        keyHint: null,
      };
    }

    return {
      configured: true,
      provider: row.provider,
      keyHint: row.key_hint,
      updatedAt: row.updated_at,
    };
  }

  static async saveUserApiKey(
    userId: string,
    provider: AIProviderType,
    plainKey: string
  ): Promise<UserApiKeyConfig> {
    const trimmed = plainKey.trim();
    if (!trimmed) {
      throw new Error('API key cannot be empty');
    }

    // 1. Verify key works with selected provider
    const aiProvider = getAIProvider(provider);
    try {
      await aiProvider.testConnection(trimmed);
    } catch (testErr: any) {
      throw new Error(`API key verification failed for ${provider}: ${testErr.message}`);
    }

    // 2. Encrypt key at rest (AES-256-GCM)
    const { encryptedKey, iv, authTag, keyHint } = encryptApiKey(trimmed);
    const db = getDb();
    const id = `key-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO user_api_keys (id, user_id, provider, encrypted_key, iv, auth_tag, key_hint, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        provider = excluded.provider,
        encrypted_key = excluded.encrypted_key,
        iv = excluded.iv,
        auth_tag = excluded.auth_tag,
        key_hint = excluded.key_hint,
        updated_at = excluded.updated_at
    `).run(id, userId, provider, encryptedKey, iv, authTag, keyHint, now, now);

    return {
      configured: true,
      provider,
      keyHint,
      updatedAt: now,
    };
  }

  static deleteUserApiKey(userId: string): boolean {
    const db = getDb();
    db.prepare('DELETE FROM user_api_keys WHERE user_id = ?').run(userId);
    return true;
  }

  private static getDecryptedUserKey(userId: string): { apiKey: string; provider: AIProviderType } {
    const db = getDb();
    const row = db
      .prepare('SELECT provider, encrypted_key, iv, auth_tag FROM user_api_keys WHERE user_id = ?')
      .get(userId) as any;

    if (!row) {
      throw new Error(
        'No AI API key configured. Please add your personal Gemini, OpenAI, or Anthropic API key in Settings.'
      );
    }

    const decrypted = decryptApiKey(row.encrypted_key, row.iv, row.auth_tag);
    return {
      apiKey: decrypted,
      provider: row.provider,
    };
  }

  static async performSearch(
    userId: string,
    institutionId: string,
    query: string,
    filters?: { branchId?: string; courseId?: string }
  ): Promise<AISearchResult> {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('Search query cannot be empty.');
    }
    if (query.trim().length > 1000) {
      throw new Error('Search query exceeds maximum limit of 1,000 characters.');
    }

    const { apiKey, provider } = this.getDecryptedUserKey(userId);
    const aiProvider = getAIProvider(provider);

    // Fetch ONLY resources for the user's institution
    const resources = ResourceService.getResources(institutionId, filters);

    const scoped: ScopedResourceContext[] = resources.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      description: r.description || '',
      branchName: r.branch_name || 'General',
      courseName: r.course_name || 'Subject',
      courseCode: r.course_code || 'GEN',
    }));

    return await aiProvider.search(query, scoped, apiKey);
  }

  static async performSummarize(
    userId: string,
    institutionId: string,
    resourceId: string
  ): Promise<AISummaryResult> {
    const { apiKey, provider } = this.getDecryptedUserKey(userId);
    const aiProvider = getAIProvider(provider);

    // Enforces 403 if resource belongs to another institution
    const resource = ResourceService.getResourceById(resourceId, institutionId);

    const scoped: ScopedResourceContext = {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      description: resource.description || '',
      branchName: resource.branch_name || 'General',
      courseName: resource.course_name || 'Subject',
      courseCode: resource.course_code || 'GEN',
    };

    return await aiProvider.summarize(scoped, apiKey);
  }

  static async performSuggest(
    userId: string,
    institutionId: string,
    userContext: { branchId?: string | null; courseId?: string | null }
  ): Promise<AISuggestionResult> {
    const { apiKey, provider } = this.getDecryptedUserKey(userId);
    const aiProvider = getAIProvider(provider);

    const resources = ResourceService.getResources(institutionId);

    const scoped: ScopedResourceContext[] = resources.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      description: r.description || '',
      branchName: r.branch_name || 'General',
      courseName: r.course_name || 'Subject',
      courseCode: r.course_code || 'GEN',
    }));

    return await aiProvider.suggest(
      {
        branch: userContext.branchId,
        course: userContext.courseId,
      },
      scoped,
      apiKey
    );
  }
}
