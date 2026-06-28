/**
 * Amazon Bedrock Provider
 *
 * Covers: Meta Llama on Bedrock, Mistral on Bedrock, Cohere on Bedrock,
 *         AI21 on Bedrock, Amazon Nova, Amazon Titan.
 *
 * Auth: AWS IAM — requires AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION
 * or ambient credentials (EC2 instance role, ECS task role, Fly.io IAM, etc.)
 *
 * Bedrock does NOT use the OpenAI API shape — it uses InvokeModel with
 * model-specific request/response bodies. We normalise to the Unimatrix
 * CompletionResult interface here.
 */

import { BaseLLMProvider } from './base.js';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';

// Model family → converse API support (all modern models use Converse)
const BEDROCK_MODELS: Record<string, { contextWindow: number; costInput: number; costOutput: number }> = {
  // Meta Llama
  'meta.llama3-3-70b-instruct-v1:0':    { contextWindow: 131072, costInput: 0.00072, costOutput: 0.00072 },
  'meta.llama3-1-405b-instruct-v1:0':   { contextWindow: 131072, costInput: 0.00532, costOutput: 0.01600 },
  // Amazon Nova
  'amazon.nova-pro-v1:0':               { contextWindow: 300000, costInput: 0.00080, costOutput: 0.00320 },
  'amazon.nova-lite-v1:0':              { contextWindow: 300000, costInput: 0.00006, costOutput: 0.00024 },
  'amazon.nova-micro-v1:0':             { contextWindow: 128000, costInput: 0.000035, costOutput: 0.000140 },
  // Mistral on Bedrock
  'mistral.mistral-large-2402-v1:0':    { contextWindow: 131072, costInput: 0.004,   costOutput: 0.012 },
  // Cohere on Bedrock
  'cohere.command-r-plus-v1:0':         { contextWindow: 128000, costInput: 0.003,   costOutput: 0.015 },
  'cohere.command-r-v1:0':              { contextWindow: 128000, costInput: 0.0005,  costOutput: 0.0015 },
  // AI21 on Bedrock
  'ai21.jamba-1-5-large-v1:0':          { contextWindow: 256000, costInput: 0.002,   costOutput: 0.008 },
  // Anthropic on Bedrock (cross-region inference)
  'us.anthropic.claude-sonnet-4-5':     { contextWindow: 200000, costInput: 0.003,   costOutput: 0.015 },
};

export class BedrockProvider extends BaseLLMProvider {
  private region: string;
  private accessKeyId?: string;
  private secretAccessKey?: string;

  constructor(
    model: string = 'amazon.nova-pro-v1:0',
    region: string = 'us-east-1',
    accessKeyId?: string,
    secretAccessKey?: string,
  ) {
    const meta = BEDROCK_MODELS[model] ?? { contextWindow: 128000, costInput: 0, costOutput: 0 };
    super('Amazon Bedrock', model, meta.costInput, meta.costOutput, meta.contextWindow, true);
    this.region = region;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
  }

  /** Build Bedrock Converse API request body */
  private buildConverseBody(messages: Message[], options?: CompletionOptions) {
    return {
      modelId: this.model,
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: [{ text: m.content }],
        })),
      system: messages
        .filter((m) => m.role === 'system')
        .map((m) => ({ text: m.content })),
      inferenceConfig: {
        maxTokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        topP: options?.topP ?? 1,
      },
    };
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    // Lazy import AWS SDK — only installed when Bedrock is used
    let BedrockRuntimeClient: any, ConverseCommand: any;
    try {
      ({ BedrockRuntimeClient, ConverseCommand } = await import('@aws-sdk/client-bedrock-runtime'));
    } catch {
      throw new Error(
        '[Unimatrix/Bedrock] @aws-sdk/client-bedrock-runtime is not installed. ' +
        'Run: pnpm add @aws-sdk/client-bedrock-runtime --filter @unimatrix/llm',
      );
    }

    const client = new BedrockRuntimeClient({
      region: this.region,
      ...(this.accessKeyId && this.secretAccessKey
        ? { credentials: { accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey } }
        : {}), // falls back to ambient IAM credentials
    });

    const start = Date.now();
    const body = this.buildConverseBody(messages, options);
    const command = new ConverseCommand(body);
    const response = await client.send(command);

    const latency = Date.now() - start;
    const content = response.output?.message?.content?.[0]?.text ?? '';
    const usage = {
      input: response.usage?.inputTokens ?? 0,
      output: response.usage?.outputTokens ?? 0,
    };
    const cost = this.calculateCost(usage.input, usage.output);

    const result: CompletionResult = {
      content,
      tokensUsed: usage.input + usage.output,
      latencyMs: latency,
      cost,
      model: this.model,
      provider: 'bedrock',
    };

    await this.maybeAutoLog(messages, result);
    return result;
  }

  async *stream(
    messages: Message[],
    options?: CompletionOptions,
  ): AsyncIterableIterator<string> {
    let BedrockRuntimeClient: any, ConverseStreamCommand: any;
    try {
      ({ BedrockRuntimeClient, ConverseStreamCommand } = await import('@aws-sdk/client-bedrock-runtime'));
    } catch {
      throw new Error('[Unimatrix/Bedrock] @aws-sdk/client-bedrock-runtime is not installed.');
    }

    const client = new BedrockRuntimeClient({
      region: this.region,
      ...(this.accessKeyId && this.secretAccessKey
        ? { credentials: { accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey } }
        : {}),
    });

    const command = new ConverseStreamCommand(this.buildConverseBody(messages, options));
    const response = await client.send(command);

    for await (const event of response.stream ?? []) {
      const delta = event.contentBlockDelta?.delta?.text;
      if (delta) yield delta;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.complete([{ role: 'user', content: 'ping' }], { maxTokens: 5 });
      return true;
    } catch {
      return false;
    }
  }
}
