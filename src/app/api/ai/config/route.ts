import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createErrorResponse } from '@/server/middleware/guard';
import { AIService } from '@/server/services/ai.service';
import { getAvailableProviders } from '@/server/ai/factory';
import { AIProviderType } from '@/server/ai/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const config = AIService.getUserApiKeyConfig(user.id);
    const availableProviders = getAvailableProviders();

    return NextResponse.json({
      success: true,
      config,
      availableProviders,
    });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    const { provider = 'gemini', apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid API key.' },
        { status: 400 }
      );
    }

    if (!['gemini', 'openai', 'anthropic'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid AI provider selected. Choose Gemini, OpenAI, or Anthropic.' },
        { status: 400 }
      );
    }

    const updatedConfig = await AIService.saveUserApiKey(user.id, provider as AIProviderType, apiKey);

    return NextResponse.json({
      success: true,
      message: `${provider.toUpperCase()} API key validated and securely stored.`,
      config: updatedConfig,
    });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    AIService.deleteUserApiKey(user.id);

    return NextResponse.json({
      success: true,
      message: 'AI API key removed.',
      config: { configured: false, provider: null, keyHint: null },
    });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
