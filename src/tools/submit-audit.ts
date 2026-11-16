import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiFetch, ApiError } from '../lib/client.js';
import type { SubmitResponse } from '../lib/types.js';

export function registerSubmitAudit(server: McpServer): void {
  server.registerTool(
    'submit_audit',
    {
      description:
        'Submit a third-party skill for an Oathe Scan behavioral security audit before installing it. ' +
        'Accepts any GitHub or ClawHub URL. Returns an audit_id to track progress. ' +
        'One submission per 60 seconds. 10 scans a month without an account. ' +
        'This server submits without an API key. ' +
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
        force_rescan: z
          .boolean()
          .optional()
          .describe('Bypass deduplication and force a fresh audit'),
      },
    },
    async ({ skill_url, notification_email, force_rescan }) => {
      try {
        const body: Record<string, unknown> = { skill_url };
        if (notification_email) {
          body.notification_email = notification_email;
        }
        if (force_rescan) {
          body.force_rescan = true;
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
                  text:
                    err.message && err.message !== 'Unknown error'
                      ? err.message
                      : 'Limit reached. One submission per 60 seconds, and 10 scans a month without an account.',
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
