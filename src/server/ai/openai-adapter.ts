import {
  AIProvider,
  AIProviderType,
  ScopedResourceContext,
  AISearchResult,
  AISummaryResult,
  AISuggestionResult,
  AIProviderError,
} from './types';

export class OpenAIAdapter implements AIProvider {
  readonly name: AIProviderType = 'openai';
  private get model(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
    const trimmedKey = apiKey.trim();
    const url = 'https://api.openai.com/v1/chat/completions';

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${trimmedKey}`,
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
    } catch (networkErr: any) {
      if (networkErr.name === 'TimeoutError' || networkErr.name === 'AbortError') {
        throw new AIProviderError('OpenAI request timed out after 30 seconds. Please try again.', 'openai');
      }
      throw new AIProviderError(`OpenAI network connection failure: ${networkErr.message}`, 'openai');
    }

    if (!response.ok) {
      const rawText = await response.text();
      const sanitized = rawText.replace(new RegExp(trimmedKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '[REDACTED_API_KEY]');

      if (response.status === 401) {
        throw new AIProviderError('Invalid OpenAI API key. Please check your credentials.', 'openai', {
          statusCode: 401,
          isInvalidKey: true,
        });
      }
      if (response.status === 429) {
        throw new AIProviderError('OpenAI rate limit or balance quota exceeded. Please check your OpenAI account billing.', 'openai', {
          statusCode: 429,
          isRateLimit: true,
        });
      }
      if (response.status >= 500) {
        throw new AIProviderError('OpenAI service is temporarily experiencing downtime. Please try again shortly.', 'openai', {
          statusCode: response.status,
        });
      }
      throw new AIProviderError(`OpenAI error (${response.status}): ${sanitized.slice(0, 300)}`, 'openai', {
        statusCode: response.status,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new AIProviderError('OpenAI returned an empty response.', 'openai');
    }
    return content;
  }

  async testConnection(apiKey: string): Promise<boolean> {
    const text = await this.callOpenAI(
      'You are a health check assistant.',
      'Respond with JSON: {"status": "ok"}',
      apiKey
    );
    return text.includes('ok');
  }

  async search(
    query: string,
    resources: ScopedResourceContext[],
    apiKey: string
  ): Promise<AISearchResult> {
    if (resources.length === 0) {
      return {
        answer: 'No study resources found in your college repository matching this query.',
        matchedResourceIds: [],
        relevanceExplanation: 'Your college does not yet have uploaded materials for this topic.',
      };
    }

    const systemPrompt =
      'You are an academic resource assistant for students. You must only answer using the exact provided college study resources.';
    const userPrompt = `STUDENT QUERY: "${query}"

AVAILABLE COLLEGE RESOURCES:
${JSON.stringify(
  resources.map((r) => ({
    id: r.id,
    title: r.title,
    course: `${r.courseCode} - ${r.courseName}`,
    branch: r.branchName,
    type: r.type,
    description: r.description,
  })),
  null,
  2
)}

Return JSON with exact keys:
{
  "answer": "Clear explanation referencing available materials",
  "matchedResourceIds": ["resource-id-1"],
  "relevanceExplanation": "Why these resources match"
}`;

    const raw = await this.callOpenAI(systemPrompt, userPrompt, apiKey);
    try {
      return JSON.parse(raw);
    } catch {
      return {
        answer: raw,
        matchedResourceIds: resources.slice(0, 2).map((r) => r.id),
        relevanceExplanation: 'Identified matching resources from college repository.',
      };
    }
  }

  async summarize(resource: ScopedResourceContext, apiKey: string): Promise<AISummaryResult> {
    const systemPrompt = 'You are an academic study assistant.';
    const userPrompt = `Summarize this college resource for exam preparation:
Title: ${resource.title}
Course: ${resource.courseCode} ${resource.courseName}
Description: ${resource.description}

Return JSON with exact keys:
{
  "summary": "3-4 concise sentences of key takeaways",
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "suggestedStudyQuestions": ["Self-test question 1?", "Self-test question 2?"]
}`;

    const raw = await this.callOpenAI(systemPrompt, userPrompt, apiKey);
    try {
      return JSON.parse(raw);
    } catch {
      return {
        summary: `${resource.title} - syllabus summary for ${resource.courseName}.`,
        keyTopics: [resource.courseName],
        suggestedStudyQuestions: [`Explain the core concepts of ${resource.title}.`],
      };
    }
  }

  async suggest(
    studentContext: { branch?: string | null; course?: string | null },
    resources: ScopedResourceContext[],
    apiKey: string
  ): Promise<AISuggestionResult> {
    if (resources.length === 0) return { recommendations: [] };

    const systemPrompt = 'You are an academic advisor.';
    const userPrompt = `Student enrolled in Branch: "${studentContext.branch || 'Engineering'}", Course: "${
      studentContext.course || 'Core'
    }".
College resources:
${JSON.stringify(resources.map((r) => ({ id: r.id, title: r.title, course: r.courseName })))}

Return JSON with exact key "recommendations" as an array of { "resourceId": string, "reason": string }`;

    const raw = await this.callOpenAI(systemPrompt, userPrompt, apiKey);
    try {
      return JSON.parse(raw);
    } catch {
      return {
        recommendations: resources.slice(0, 3).map((r) => ({
          resourceId: r.id,
          reason: `Recommended core resource for ${r.courseName}.`,
        })),
      };
    }
  }
}
