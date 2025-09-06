/**
 * The maximum number of tokens to generate in a single AI response.
 * This is a safeguard to prevent runaway generation and control costs.
 * @see https://docs.anthropic.com/en/docs/about-claude/models
 */
export const MAX_TOKENS = 8000;

/**
 * The maximum number of times the application will automatically ask the AI
 * to continue a response that was truncated due to hitting the token limit.
 * This prevents infinite loops of continuation.
 */
export const MAX_RESPONSE_SEGMENTS = 2;
