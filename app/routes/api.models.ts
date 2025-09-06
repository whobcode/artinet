import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { MODEL_LIST } from '~/utils/constants';

/**
 * A Remix loader function that serves the list of available AI models.
 * A simple, yet essential, function to inform the frontend which tools
 * are at its disposal.
 *
 * @param {LoaderFunctionArgs} args - The Remix loader arguments (unused in this case).
 * @returns {Promise<Response>} A JSON response containing the array of model definitions.
 */
export async function loader(args: LoaderFunctionArgs) {
  return json(MODEL_LIST);
}
