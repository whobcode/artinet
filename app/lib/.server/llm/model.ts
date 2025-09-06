import { getAPIKey, getBaseURL } from '~/lib/.server/llm/api-key';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI, LanguageModel } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ollama } from 'ollama-ai-provider';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createMistral } from '@ai-sdk/mistral';

/**
 * Creates an Anthropic language model client.
 * @param {string} apiKey - The API key for the Anthropic service.
 * @param {string} model - The specific model to use (e.g., 'claude-3-5-sonnet-20240620').
 * @returns {LanguageModel} An instance of the Anthropic model client.
 */
export function getAnthropicModel(apiKey: string, model: string): LanguageModel {
  const anthropic = createAnthropic({ apiKey });
  return anthropic(model);
}

/**
 * Creates a client for an "OpenAI-like" service, which adheres to the OpenAI API but uses a different base URL.
 * @param {string} baseURL - The base URL of the OpenAI-compatible API.
 * @param {string} apiKey - The API key for the service.
 * @param {string} model - The specific model to use.
 * @returns {LanguageModel} An instance of the OpenAI model client configured for a custom base URL.
 */
export function getOpenAILikeModel(baseURL: string, apiKey: string, model: string): LanguageModel {
  const openai = createOpenAI({ baseURL, apiKey });
  return openai(model);
}

/**
 * Creates an OpenAI language model client.
 * @param {string} apiKey - The API key for the OpenAI service.
 * @param {string} model - The specific model to use (e.g., 'gpt-4-turbo').
 * @returns {LanguageModel} An instance of the OpenAI model client.
 */
export function getOpenAIModel(apiKey: string, model: string): LanguageModel {
  const openai = createOpenAI({ apiKey });
  return openai(model);
}

/**
 * Creates a Mistral language model client.
 * @param {string} apiKey - The API key for the Mistral service.
 * @param {string} model - The specific model to use.
 * @returns {LanguageModel} An instance of the Mistral model client.
 */
export function getMistralModel(apiKey: string, model: string): LanguageModel {
  const mistral = createMistral({ apiKey });
  return mistral(model);
}

/**
 * Creates a Google Generative AI (Gemini) language model client.
 * @param {string} apiKey - The API key for the Google AI service.
 * @param {string} model - The specific model to use (e.g., 'gemini-1.5-pro-latest').
 * @returns {LanguageModel} An instance of the Google model client.
 */
export function getGoogleModel(apiKey: string, model: string): LanguageModel {
  const google = createGoogleGenerativeAI({ apiKey });
  return google(model);
}

/**
 * Creates a Groq language model client.
 * Note: Groq uses an OpenAI-compatible API, so we use the OpenAI client with a custom base URL.
 * @param {string} apiKey - The API key for the Groq service.
 * @param {string} model - The specific model to use.
 * @returns {LanguageModel} An instance of the OpenAI model client configured for Groq.
 */
export function getGroqModel(apiKey: string, model: string): LanguageModel {
  const openai = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });
  return openai(model);
}

/**
 * Creates an Ollama language model client for local inference.
 * @param {string} baseURL - The base URL of the local Ollama server.
 * @param {string} model - The specific model to use.
 * @returns {LanguageModel} An instance of the Ollama model client.
 */
export function getOllamaModel(baseURL: string, model: string): LanguageModel {
  const Ollama = ollama(model, { numCtx: 32768 });
  Ollama.config.baseURL = `${baseURL}/api`;
  return Ollama;
}

/**
 * Creates a Deepseek language model client.
 * Note: Deepseek uses an OpenAI-compatible API.
 * @param {string} apiKey - The API key for the Deepseek service.
 * @param {string} model - The specific model to use.
 * @returns {LanguageModel} An instance of the OpenAI model client configured for Deepseek.
 */
export function getDeepseekModel(apiKey: string, model:string): LanguageModel {
  const openai = createOpenAI({
    baseURL: 'https://api.deepseek.com/beta',
    apiKey,
  });
  return openai(model);
}

/**
 * Creates an OpenRouter language model client.
 * @param {string} apiKey - The API key for the OpenRouter service.
 * @param {string} model - The specific model to use.
 * @returns {LanguageModel} An instance of the OpenRouter model client.
 */
export function getOpenRouterModel(apiKey: string, model: string): LanguageModel {
  const openRouter = createOpenRouter({ apiKey });
  return openRouter.chat(model);
}

/**
 * Creates an xAI (Grok) language model client.
 * Note: xAI uses an OpenAI-compatible API.
 * @param {string} apiKey - The API key for the xAI service.
 * @param {string} model - The specific model to use (e.g., 'grok-1').
 * @returns {LanguageModel} An instance of the OpenAI model client configured for xAI.
 */
export function getXAIModel(apiKey: string, model: string): LanguageModel {
  const openai = createOpenAI({
    baseURL: 'https://api.x.ai/v1',
    apiKey,
  });
  return openai(model);
}

/**
 * The grand dispatcher for AI models. This function takes a provider name
 * and returns a fully configured language model client.
 * It is the single source of truth for model instantiation.
 *
 * @param {string} provider - The name of the AI provider (e.g., 'OpenAI', 'Anthropic').
 * @param {string} model - The specific model identifier.
 * @param {Env} env - The Cloudflare environment, used to retrieve API keys and base URLs.
 * @returns {LanguageModel} A fully configured language model client.
 */
export function getModel(provider: string, model: string, env: Env): LanguageModel {
  const apiKey = getAPIKey(env, provider) ?? '';
  const baseURL = getBaseURL(env, provider) ?? '';

  switch (provider) {
    case 'Anthropic':
      return getAnthropicModel(apiKey, model);
    case 'OpenAI':
      return getOpenAIModel(apiKey, model);
    case 'Groq':
      return getGroqModel(apiKey, model);
    case 'OpenRouter':
      return getOpenRouterModel(apiKey, model);
    case 'Google':
      return getGoogleModel(apiKey, model);
    case 'OpenAILike':
      return getOpenAILikeModel(baseURL, apiKey, model);
    case 'Deepseek':
      return getDeepseekModel(apiKey, model);
    case 'Mistral':
      return getMistralModel(apiKey, model);
    case 'xAI':
      return getXAIModel(apiKey, model);
    default:
      return getOllamaModel(baseURL, model);
  }
}
