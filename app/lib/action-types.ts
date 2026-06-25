/**
 * Shared typed action response payloads — used across all POST action routes.
 *
 * Pattern:
 *   return Response.json({ success: true } satisfies ActionResult)
 *   return Response.json({ success: false, error: '...', status: 422 } satisfies ActionResult)
 *
 * Consumers check `result.success` to narrow the type before accessing `data` or `error`.
 */

/** Successful action with no payload. */
export type ActionSuccess = { success: true };

/** Successful action with typed data payload. */
export type ActionSuccessData<T> = { success: true; data: T };

/** Failed action. `status` is an HTTP status hint (422, 429, 500, etc.). */
export interface ActionError {
  success: false;
  error: string;
  status?: number;
}

/**
 * Union type for action routes with no typed return data.
 * @example
 *   async function action(): Promise<Response> {
 *     return Response.json({ success: true } satisfies ActionResult);
 *   }
 */
export type ActionResult = ActionSuccess | ActionError;

/**
 * Union type for action routes that return a typed data payload on success.
 * @example
 *   type ContactData = { messageId: string };
 *   return Response.json({ success: true, data: { messageId: '...' } } satisfies ActionResultData<ContactData>);
 */
export type ActionResultData<T> = ActionSuccessData<T> | ActionError;
