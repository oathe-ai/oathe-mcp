import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiFetch, ApiError } from '../lib/client.js';
import type { AuditStatusResponse } from '../lib/types.js';

export function registerCheckStatus(server: McpServer): void {
  server.registerTool(
    'check_audit_status',
    {
      description:
        'Check the status of an Oathe security audit submitted via submit_audit. ' +
        'Poll every 5 seconds until status is "complete" or "failed". ' +
        'Statuses: queued, scanning, analyzing, summarizing, finalizing, complete, failed. ' +
        'Terminal statuses: complete, failed. ' +
        'When complete, the response includes the full audit report with trust score, verdict, and findings.',
      inputSchema: {
        audit_id: z
          .string()
          .describe('UUID returned by submit_audit'),
      },
    },
    async ({ audit_id }) => {
      try {
        const res = await apiFetch(`/api/audit/${audit_id}`);
        const data = (await res.json()) as AuditStatusResponse;
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: 'Audit ID not found — may have expired or be invalid.',
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
