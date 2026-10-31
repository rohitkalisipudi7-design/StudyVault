import {
  AIProvider,
  AIProviderType,
  ScopedResourceContext,
  AISearchResult,
  AISummaryResult,
  AISuggestionResult,
  AIProviderError,
} from './types';

export class AnthropicAdapter implements AIProvider {
  readonly name: AIProviderType = 'anthropic';
  private model = 'claude-3-haiku-20240307';

  private async callAnthropic(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
    const url = 'https://api.anthropic.com/v1/messages';

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          temperature: 0.2,
        }),
      });
    } catch (networkErr: any) {
      throw new AIProviderError(`Anthropic network connection failure: ${networkErr.message}`, 'anthropic');
    }

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 401) {
        throw new AIProviderError('Invalid Anthropic API key.', 'anthropic', {
          statusCode: 401,
          isInvalidKey: true,
        });
      }
      if (response.status === 429) {
        throw new AIProviderError('Anthropic rate limit or quota exceeded.', 'anthropic', {
          statusCode: 429,
          isRateLimit: true,
        });
      }
      if (response.status >= 500) {
        throw new AIProviderError('Anthropic service is temporarily unavailable.', 'anthropic', {
          statusCode: response.status,
        });
      }
      throw new AIProviderError(`Anthropic error (${response.status}): ${errText}`, 'anthropic', {
        statusCode: response.status,
      });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) {
      throw new AIProviderError('Anthropic returned an empty response.', 'anthropic');
    }
    return content;
  }

  async testConnection(apiKey: string): Promise<boolean> {
    const text = await this.callAnthropic('You are a health check system.', 'Respond with {"status": "ok"}', apiKey);
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
      'You are an academic resource assistant. Answer strictly based on the provided college study materials and output valid JSON.';
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

Return strictly valid JSON:
{
  "answer": "Explanation of answers based on college materials",
  "matchedResourceIds": ["resource-id"],
  "relevanceExplanation": "Why these match"
}`;

    const raw = await this.callAnthropic(systemPrompt, userPrompt, apiKey);
    try {
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return {
        answer: raw,
        matchedResourceIds: resources.slice(0, 2).map((r) => r.id),
        relevanceExplanation: 'Identified matching resources from college repository.',
      };
    }
  }

  async summarize(resource: ScopedResourceContext, apiKey: string): Promise<AISummaryResult> {
    const systemPrompt = 'You are an academic study assistant. Return strictly valid JSON.';
    const userPrompt = `Summarize this college resource:
Title: ${resource.title}
Course: ${resource.courseCode} ${resource.courseName}
Description: ${resource.description}

Return strictly valid JSON:
{
  "summary": "3-4 concise sentences of core exam takeaways",
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "suggestedStudyQuestions": ["Self-test question 1?", "Self-test question 2?"]
}`;

    const raw = await this.callAnthropic(systemPrompt, userPrompt, apiKey);
    try {
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return {
        summary: `${resource.title} - core concepts for ${resource.courseName}.`,
        keyTopics: [resource.courseName],
        suggestedStudyQuestions: [`How do concepts in ${resource.title} apply to exams?`],
      };
    }
  }

  async suggest(
    studentContext: { branch?: string | null; course?: string | null },
    resources: ScopedResourceContext[],
    apiKey: string
  ): Promise<AISuggestionResult> {
    if (resources.length === 0) return { recommendations: [] };

    const systemPrompt = 'You are an academic advisor. Return strictly valid JSON.';
    const userPrompt = `Student enrolled in Branch: "${studentContext.branch || 'Engineering'}", Course: "${
      studentContext.course || 'Core'
    }".
College resources:
${JSON.stringify(resources.map((r) => ({ id: r.id, title: r.title, course: r.courseName })))}

Return strictly valid JSON with key "recommendations" array of { "resourceId": string, "reason": string }`;

    const raw = await this.callAnthropic(systemPrompt, userPrompt, apiKey);
    try {
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return {
        recommendations: resources.slice(0, 3).map((r) => ({
          resourceId: r.id,
          reason: `Recommended resource for ${r.courseName}.`,
        })),
      };
    }
  }
}
