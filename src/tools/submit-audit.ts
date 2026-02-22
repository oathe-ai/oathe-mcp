import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiFetch, ApiError } from '../lib/client.js';
import type { SubmitResponse } from '../lib/types.js';

export function registerSubmitAudit(server: McpServer): void {
  server.registerTool(
    'submit_audit',
    {
      description:
        'Submit a GitHub or ClawHub URL for an Oathe security audit. ' +
        'Returns an audit_id to track progress. ' +
        'Rate limited: one submission per 60 seconds per IP. ' +
        'Returns existing audit_id if URL was already scanned (deduplicated: true). ' +
        'Use check_audit_status to poll for results.',
      inputSchema: {
        skill_url: z
          .string()
          .describe('GitHub or ClawHub URL of the skill/repo to audit'),
        notification_email: z
          .string()
          .email()
          .optional()
          .describe('Optional email to notify when audit completes'),
      },
    },
    async ({ skill_url, notification_email }) => {
      try {
        const body: Record<string, string> = { skill_url };
        if (notification_email) {
          body.notification_email = notification_email;
        }

        const res = await apiFetch('/api/submit', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        const data = (await res.json()) as SubmitResponse;
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 429) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: 'Rate limited — wait 60 seconds before resubmitting.',
                },
              ],
              isError: true,
            };
          }
          return {
            content: [{ type: 'text' as const, text: err.message }],
            isError: true,
          };
        }
        throw err;
      }
    },
  );
}
