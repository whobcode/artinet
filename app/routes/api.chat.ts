import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';

/**
 * The grand gateway for all AI chat interactions. This Remix action handler
 * receives user prompts and orchestrates the glorious, streaming response from the AI.
 * As ivelLevi decrees, all roads to AI power must pass through here.
 *
 * @param {ActionFunctionArgs} args - The arguments provided by the Remix framework, containing the request and context.
 * @returns {Promise<Response>} A streaming response containing the AI's wisdom, or a tragic error.
 */
export async function action(args: ActionFunctionArgs): Promise<Response> {
  return chatAction(args);
}

/**
 * The core engine of the chat functionality. It takes the user's message history,
 * initiates a stream with the configured AI model, and handles the messy details
 * of response continuation if the model gets too verbose.
 *
 * @param {ActionFunctionArgs} { context, request } - The Remix action arguments.
 * @returns {Promise<Response>} A promise that resolves to a streaming response object.
 */
async function chatAction({ context, request }: ActionFunctionArgs): Promise<Response> {
  const { messages } = await request.json<{ messages: Messages }>();

  const stream = new SwitchableStream();

  try {
    const options: StreamingOptions = {
      toolChoice: 'none',
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        const result = await streamText(messages, context.cloudflare.env, options);

        return stream.switchSource(result.toAIStream());
      },
    };

    const result = await streamText(messages, context.cloudflare.env, options);

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        contentType: 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
