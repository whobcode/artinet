import { streamText as _streamText, convertToCoreMessages, CoreMessage } from 'ai';
import { getModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { MODEL_LIST, DEFAULT_MODEL, DEFAULT_PROVIDER } from '~/utils/constants';

// This file is the central point for interacting with the Vercel AI SDK.
// It prepares messages, selects the appropriate model, and initiates the stream.

export type Messages = CoreMessage[];
export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model' | 'messages' | 'system'>;

/**
 * Extracts a model identifier from the user's message content.
 * Allows users to specify a model with the syntax `[Model: model-name]`.
 * If no model is specified, it wisely defaults to the pre-configured default.
 *
 * @param {CoreMessage} message - The user's message object.
 * @returns {{model: string, content: string}} An object containing the identified model and the cleaned message content.
 */
function extractModelFromMessage(message: CoreMessage): { model: string; content: string } {
  if (typeof message.content !== 'string') {
    return { model: DEFAULT_MODEL, content: '' };
  }
  const modelRegex = /^\[Model: (.*?)\]\n\n/;
  const match = message.content.match(modelRegex);

  if (match) {
    const model = match[1];
    const content = message.content.replace(modelRegex, '');
    return { model, content };
  }

  return { model: DEFAULT_MODEL, content: message.content };
}

/**
 * The primary function for initiating a streaming text response from an AI model.
 * It processes the message history, determines the correct model to use,
 * and then invokes the Vercel AI SDK's `streamText` function.
 *
 * @param {Messages} messages - The history of messages in the conversation.
 * @param {Env} env - The Cloudflare environment variables, used for API keys.
 * @param {StreamingOptions} [options] - Optional streaming options to pass to the AI SDK.
 * @returns {Promise<ReturnType<typeof _streamText>>} A promise that resolves to the AI's streaming response.
 */
export function streamText(messages: Messages, env: Env, options?: StreamingOptions) {
  let currentModel = DEFAULT_MODEL;
  const processedMessages = messages.map((message) => {
    if (message.role === 'user') {
      const { model, content } = extractModelFromMessage(message);
      if (model && MODEL_LIST.find((m) => m.name === model)) {
        currentModel = model; // Update the current model
      }
      return { ...message, content };
    }
    return message;
  });

  const provider = MODEL_LIST.find((model) => model.name === currentModel)?.provider || DEFAULT_PROVIDER;

  return _streamText({
    model: getModel(provider, currentModel, env),
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    // headers: {
    //   'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
    // },
    messages: convertToCoreMessages(processedMessages),
    ...options,
  });
}
