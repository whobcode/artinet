import { env } from 'node:process';

/**
 * Retrieves the API key for a given AI provider from the environment.
 * It intelligently checks both the Node.js process environment (for local `wrangler dev`)
 * and the Cloudflare environment object (for deployed workers).
 *
 * @param {Env} cloudflareEnv - The Cloudflare worker environment object.
 * @param {string} provider - The name of the AI provider (e.g., 'OpenAI').
 * @returns {string | undefined} The API key, or undefined if not found.
 */
export function getAPIKey(cloudflareEnv: Env, provider: string): string | undefined {
  switch (provider) {
    case 'Anthropic':
      return env.ANTHROPIC_API_KEY ?? cloudflareEnv.ANTHROPIC_API_KEY;
    case 'OpenAI':
      return env.OPENAI_API_KEY ?? cloudflareEnv.OPENAI_API_KEY;
    case 'Google':
      return env.GOOGLE_GENERATIVE_AI_API_KEY ?? cloudflareEnv.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'Groq':
      return env.GROQ_API_KEY ?? cloudflareEnv.GROQ_API_KEY;
    case 'OpenRouter':
      return env.OPEN_ROUTER_API_KEY ?? cloudflareEnv.OPEN_ROUTER_API_KEY;
    case 'Deepseek':
      return env.DEEPSEEK_API_KEY ?? cloudflareEnv.DEEPSEEK_API_KEY;
    case 'Mistral':
      return env.MISTRAL_API_KEY ?? cloudflareEnv.MISTRAL_API_KEY;
    case 'OpenAILike':
      return env.OPENAI_LIKE_API_KEY ?? cloudflareEnv.OPENAI_LIKE_API_KEY;
    case 'xAI':
      return env.XAI_API_KEY ?? cloudflareEnv.XAI_API_KEY;
    default:
      return undefined;
  }
}

/**
 * Retrieves the base URL for a given AI provider from the environment.
 * This is used for services that are OpenAI-compatible but self-hosted,
 * or for local models like Ollama.
 *
 * @param {Env} cloudflareEnv - The Cloudflare worker environment object.
 * @param {string} provider - The name of the AI provider.
 * @returns {string} The base URL for the service.
 */
export function getBaseURL(cloudflareEnv: Env, provider: string): string {
  switch (provider) {
    case 'OpenAILike':
      return env.OPENAI_LIKE_API_BASE_URL ?? cloudflareEnv.OPENAI_LIKE_API_BASE_URL ?? '';
    case 'Ollama':
      let baseUrl = env.OLLAMA_API_BASE_URL ?? cloudflareEnv.OLLAMA_API_BASE_URL ?? 'http://localhost:11434';
      if (env.RUNNING_IN_DOCKER === 'true') {
        baseUrl = baseUrl.replace('localhost', 'host.docker.internal');
      }
      return baseUrl;
    default:
      return '';
  }
}
