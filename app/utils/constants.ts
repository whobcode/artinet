import type { ModelInfo, OllamaApiResponse, OllamaModel } from './types';

/** The name of the working directory inside the WebContainer. */
export const WORK_DIR_NAME = 'project';

/** The absolute path to the working directory. */
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;

/** The XML tag name used to wrap file modifications in prompts. */
export const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications';

/** A regex to extract the model name from a prompt, e.g., `[Model: model-name]`. */
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;

/** The default AI model to use if none is specified. */
export const DEFAULT_MODEL = 'claude-3-5-sonnet-20240620';

/** The default AI provider to use if none is specified. */
export const DEFAULT_PROVIDER = 'Anthropic';

/**
 * A static list of well-known AI models.
 * This list is combined with dynamically fetched models from local services.
 */
const staticModels: ModelInfo[] = [
  { name: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { name: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { name: 'anthropic/claude-3.5-sonnet', label: 'Anthropic: Claude 3.5 Sonnet (OpenRouter)', provider: 'OpenRouter' },
  { name: 'anthropic/claude-3-haiku', label: 'Anthropic: Claude 3 Haiku (OpenRouter)', provider: 'OpenRouter' },
  { name: 'deepseek/deepseek-coder', label: 'Deepseek-Coder V2 236B (OpenRouter)', provider: 'OpenRouter' },
  { name: 'google/gemini-flash-1.5', label: 'Google Gemini Flash 1.5 (OpenRouter)', provider: 'OpenRouter' },
  { name: 'google/gemini-pro-1.5', label: 'Google Gemini Pro 1.5 (OpenRouter)', provider: 'OpenRouter' },
  { name: 'x-ai/grok-beta', label: "xAI Grok Beta (OpenRouter)", provider: 'OpenRouter' },
  { name: 'mistralai/mistral-nemo', label: 'OpenRouter Mistral Nemo (OpenRouter)', provider: 'OpenRouter' },
  { name: 'qwen/qwen-110b-chat', label: 'OpenRouter Qwen 110b Chat (OpenRouter)', provider: 'OpenRouter' },
  { name: 'cohere/command', label: 'Cohere Command (OpenRouter)', provider: 'OpenRouter' },
  { name: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash', provider: 'Google' },
  { name: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', provider: 'Google'},
  { name: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70b (Groq)', provider: 'Groq' },
  { name: 'llama-3.1-8b-instant', label: 'Llama 3.1 8b (Groq)', provider: 'Groq' },
  { name: 'llama-3.2-11b-vision-preview', label: 'Llama 3.2 11b (Groq)', provider: 'Groq' },
  { name: 'llama-3.2-3b-preview', label: 'Llama 3.2 3b (Groq)', provider: 'Groq' },
  { name: 'llama-3.2-1b-preview', label: 'Llama 3.2 1b (Groq)', provider: 'Groq' },
  { name: 'claude-3-opus-20240229', label: 'Claude 3 Opus', provider: 'Anthropic' },
  { name: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { name: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', provider: 'Anthropic' },
  { name: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
  { name: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
  { name: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
  { name: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { name: 'grok-beta', label: "xAI Grok Beta", provider: 'xAI' },
  { name: 'deepseek-coder', label: 'Deepseek-Coder', provider: 'Deepseek'},
  { name: 'deepseek-chat', label: 'Deepseek-Chat', provider: 'Deepseek'},
  { name: 'open-mistral-7b', label: 'Mistral 7B', provider: 'Mistral' },
  { name: 'open-mixtral-8x7b', label: 'Mistral 8x7B', provider: 'Mistral' },
  { name: 'open-mixtral-8x22b', label: 'Mistral 8x22B', provider: 'Mistral' },
  { name: 'open-codestral-mamba', label: 'Codestral Mamba', provider: 'Mistral' },
  { name: 'open-mistral-nemo', label: 'Mistral Nemo', provider: 'Mistral' },
  { name: 'ministral-8b-latest', label: 'Mistral 8B', provider: 'Mistral' },
  { name: 'mistral-small-latest', label: 'Mistral Small', provider: 'Mistral' },
  { name: 'codestral-latest', label: 'Codestral', provider: 'Mistral' },
  { name: 'mistral-large-latest', label: 'Mistral Large Latest', provider: 'Mistral' },
];

/**
 * The master list of available AI models.
 * It is initialized with the static list and then dynamically populated
 * with models from local services like Ollama.
 */
export let MODEL_LIST: ModelInfo[] = [...staticModels];

/**
 * Determines the correct base URL for Ollama, accounting for Docker environments.
 * @returns {string} The base URL for the Ollama API.
 */
const getOllamaBaseUrl = (): string => {
  const defaultBaseUrl = import.meta.env.OLLAMA_API_BASE_URL || 'http://localhost:11434';
  if (typeof window !== 'undefined') {
    return defaultBaseUrl;
  }
  const isDocker = process.env.RUNNING_IN_DOCKER === 'true';
  return isDocker
    ? defaultBaseUrl.replace("localhost", "host.docker.internal")
    : defaultBaseUrl;
};

/**
 * Fetches the list of available models from a local Ollama server.
 * @returns {Promise<ModelInfo[]>} A promise that resolves to a list of Ollama models.
 */
async function getOllamaModels(): Promise<ModelInfo[]> {
  try {
    const base_url = getOllamaBaseUrl();
    const response = await fetch(`${base_url}/api/tags`);
    const data = await response.json() as OllamaApiResponse;
    return data.models.map((model: OllamaModel) => ({
      name: model.name,
      label: `${model.name} (${model.details.parameter_size})`,
      provider: 'Ollama',
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Fetches the list of available models from an OpenAI-compatible API.
 * @returns {Promise<ModelInfo[]>} A promise that resolves to a list of available models.
 */
async function getOpenAILikeModels(): Promise<ModelInfo[]> {
 try {
   const base_url =import.meta.env.OPENAI_LIKE_API_BASE_URL || "";
   if (!base_url) {
      return [];
   }
   const api_key = import.meta.env.OPENAI_LIKE_API_KEY ?? "";
   const response = await fetch(`${base_url}/models`, {
     headers: {
       Authorization: `Bearer ${api_key}`,
     }
   });
    const res = await response.json() as any;
    return res.data.map((model: any) => ({
      name: model.id,
      label: model.id,
      provider: 'OpenAILike',
    }));
 } catch (e) {
   return []
 }
}

/**
 * Initializes the master model list by fetching dynamic models and combining
 * them with the static list. This function is called once on application startup.
 * @returns {Promise<void>}
 */
async function initializeModelList(): Promise<void> {
  const ollamaModels = await getOllamaModels();
  const openAiLikeModels = await getOpenAILikeModels();
  MODEL_LIST = [...ollamaModels,...openAiLikeModels, ...staticModels];
}

// Fire and forget the initialization.
initializeModelList();

export { getOllamaModels, getOpenAILikeModels, initializeModelList };
