import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment } from './setup';
import { getAIProvider, getAvailableProviders } from '../src/server/ai/factory';
import { AIService } from '../src/server/services/ai.service';
import { ResourceService } from '../src/server/services/resource.service';

const env = setupTestEnvironment();
after(() => env.cleanup());

test('1. AI Layer: Multi-provider abstraction factory', () => {
  const providers = getAvailableProviders();
  assert.equal(providers.length, 3, 'Must support Gemini, OpenAI, and Anthropic');

  const gemini = getAIProvider('gemini');
  assert.equal(gemini.name, 'gemini');
  assert.equal(typeof gemini.search, 'function');
  assert.equal(typeof gemini.summarize, 'function');
  assert.equal(typeof gemini.suggest, 'function');

  const openai = getAIProvider('openai');
  assert.equal(openai.name, 'openai');

  const anthropic = getAIProvider('anthropic');
  assert.equal(anthropic.name, 'anthropic');
});

test('2. AI Layer: Context strictly isolated to caller institution', () => {
  const auResources = ResourceService.getResources('inst-au');
  const gvpceResources = ResourceService.getResources('inst-gvpce');

  assert.ok(auResources.length > 0);
  assert.ok(gvpceResources.length > 0);

  const auIds = new Set(auResources.map((r: any) => r.id));
  for (const gr of gvpceResources) {
    assert.equal(auIds.has(gr.id), false, 'AU resource pool must never contain GVPCE resources');
  }
});

test('3. AI Layer: Input validation rejects oversized queries', async () => {
  const longQuery = 'X'.repeat(1005);
  await assert.rejects(
    async () => {
      await AIService.performSearch('user-au-student', 'inst-au', longQuery);
    },
    /Search query exceeds maximum limit of 1,000 characters/
  );
});

test('4. AI Layer: Error messages never leak the raw API key', async () => {
  const secretRawKey = 'SECRET_API_KEY_1234567890_XYZ';

  // Attempt search with invalid key
  try {
    const provider = getAIProvider('gemini');
    await provider.search('test query', [], secretRawKey);
  } catch (err: any) {
    // Error message must NOT contain the full raw key
    assert.equal(
      err.message.includes(secretRawKey),
      false,
      'Error message must never leak the plain API key'
    );
  }
});
