import {
  AIProvider,
  AIProviderType,
  ScopedResourceContext,
  AISearchResult,
  AISummaryResult,
  AISuggestionResult,
  AIProviderError,
} from './types';

export class GeminiAdapter implements AIProvider {
  readonly name: AIProviderType = 'gemini';
  private model = 'gemini-1.5-flash';

  private async callGemini(prompt: string, apiKey: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      });
    } catch (networkErr: any) {
      throw new AIProviderError(
        `Gemini network connection failure: ${networkErr.message}`,
        'gemini'
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 400 || response.status === 403) {
        throw new AIProviderError(
          'Invalid Gemini API key or unauthorized project.',
          'gemini',
          { statusCode: response.status, isInvalidKey: true }
        );
      }
      if (response.status === 429) {
        throw new AIProviderError(
          'Gemini rate limit exceeded. Please try again shortly or check your Google AI quota.',
          'gemini',
          { statusCode: 429, isRateLimit: true }
        );
      }
      if (response.status >= 500) {
        throw new AIProviderError(
          'Google Gemini service is currently experiencing an outage. Please try again later.',
          'gemini',
          { statusCode: response.status }
        );
      }
      throw new AIProviderError(`Gemini error (${response.status}): ${errText}`, 'gemini', {
        statusCode: response.status,
      });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new AIProviderError('Gemini returned an empty response.', 'gemini');
    }
    return candidate;
  }

  async testConnection(apiKey: string): Promise<boolean> {
    const text = await this.callGemini('Respond with "OK"', apiKey);
    return text.length > 0;
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

    const prompt = `You are an academic resource assistant for students at their university.
STUDENT QUESTION: "${query}"

AVAILABLE COLLEGE STUDY RESOURCES (You MUST strictly limit your answer to these exact resources):
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

TASK:
1. Identify which resource IDs directly help answer or prepare for the student's question.
2. Provide a clear, direct answer referencing the available materials.
3. Return strictly valid JSON in this exact structure:
{
  "answer": "Direct answer explaining how the available college resources address the topic",
  "matchedResourceIds": ["res-id-1", "res-id-2"],
  "relevanceExplanation": "Why these specific resources are relevant"
}`;

    const raw = await this.callGemini(prompt, apiKey);
    return parseJsonSafely<AISearchResult>(raw, {
      answer: raw.replace(/```json/g, '').replace(/```/g, '').trim(),
      matchedResourceIds: resources.slice(0, 2).map((r) => r.id),
      relevanceExplanation: 'Resources identified from your college repository.',
    });
  }

  async summarize(resource: ScopedResourceContext, apiKey: string): Promise<AISummaryResult> {
    const prompt = `You are an academic study assistant. Provide a structured summary of the following college resource:
TITLE: ${resource.title}
COURSE: ${resource.courseCode} ${resource.courseName} (${resource.branchName})
TYPE: ${resource.type}
DESCRIPTION: ${resource.description}

Provide a high-yield summary for students preparing for exams.
Return strictly valid JSON:
{
  "summary": "3-4 concise sentences summarizing the core syllabus concepts covered",
  "keyTopics": ["Core Topic 1", "Core Topic 2", "Core Topic 3"],
  "suggestedStudyQuestions": ["Self-test question 1?", "Self-test question 2?"]
}`;

    const raw = await this.callGemini(prompt, apiKey);
    return parseJsonSafely<AISummaryResult>(raw, {
      summary: `${resource.title} covering core fundamentals of ${resource.courseName}.`,
      keyTopics: [resource.courseName, resource.branchName],
      suggestedStudyQuestions: [`How do the principles in ${resource.title} apply to exams?`],
    });
  }

  async suggest(
    studentContext: { branch?: string | null; course?: string | null },
    resources: ScopedResourceContext[],
    apiKey: string
  ): Promise<AISuggestionResult> {
    if (resources.length === 0) {
      return { recommendations: [] };
    }

    const prompt = `A student is enrolled in Branch: "${studentContext.branch || 'General Engineering'}", Course: "${
      studentContext.course || 'Core Subjects'
    }".
Here are the study resources available in their college:
${JSON.stringify(
  resources.map((r) => ({ id: r.id, title: r.title, course: r.courseName })),
  null,
  2
)}

Recommend the top 2-3 resources they should review next for exam readiness.
Return strictly valid JSON:
{
  "recommendations": [
    { "resourceId": "id-here", "reason": "Clear explanation of why this resource helps their current study plan" }
  ]
}`;

    const raw = await this.callGemini(prompt, apiKey);
    return parseJsonSafely<AISuggestionResult>(raw, {
      recommendations: resources.slice(0, 3).map((r) => ({
        resourceId: r.id,
        reason: `Recommended core resource for ${r.courseName}.`,
      })),
    });
  }
}

function parseJsonSafely<T>(text: string, fallback: T): T {
  try {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return fallback;
  }
}
