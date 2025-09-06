import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { StreamingTextResponse, parseStreamPart } from 'ai';
import { streamText } from '~/lib/.server/llm/stream-text';
import { stripIndents } from '~/utils/stripIndent';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * The entry point for refining a user's primitive scrawlings into a prompt
 * worthy of an advanced AI. This is where intellectual alchemy happens.
 * Note: A good prompt is the difference between a masterpiece and a mess.
 *
 * @param {ActionFunctionArgs} args - The Remix action arguments, bearing the user's initial message.
 * @returns {Promise<Response>} A streaming response containing the AI-improved prompt.
 */
export async function action(args: ActionFunctionArgs): Promise<Response> {
  return enhancerAction(args);
}

/**
 * Takes a user's message, wraps it in a meta-prompt, and sends it to the AI
 * with a simple, forceful instruction: "Make this better." It then transforms
 * the AI's streaming response to deliver only the pure, enhanced text.
 *
 * @param {ActionFunctionArgs} { context, request } - The Remix action arguments.
 * @returns {Promise<Response>} A promise resolving to a StreamingTextResponse of the improved prompt.
 */
async function enhancerAction({ context, request }: ActionFunctionArgs): Promise<Response> {
  const { message } = await request.json<{ message: string }>();

  try {
    const result = await streamText(
      [
        {
          role: 'user',
          content: stripIndents`
          I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

          IMPORTANT: Only respond with the improved prompt and nothing else!

          <original_prompt>
            ${message}
          </original_prompt>
        `,
        },
      ],
      context.cloudflare.env,
    );

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const processedChunk = decoder
          .decode(chunk)
          .split('\n')
          .filter((line) => line !== '')
          .map(parseStreamPart)
          .map((part) => part.value)
          .join('');

        controller.enqueue(encoder.encode(processedChunk));
      },
    });

    const transformedStream = result.toAIStream().pipeThrough(transformStream);

    return new StreamingTextResponse(transformedStream);
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
