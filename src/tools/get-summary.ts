import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiFetch, ApiError } from '../lib/client.js';
import type { SkillSummaryResponse } from '../lib/types.js';

export function registerGetSummary(server: McpServer): void {
  server.registerTool(
    'get_skill_summary',
    {
      description:
        'Get a lightweight summary of an Oathe security audit for a GitHub repository. ' +
        'Returns trust score, verdict, recommendation, and finding counts ' +
        'without full report details. ' +
        'Use get_audit_report for the complete report with all findings.',
      inputSchema: {
        owner: z.string().describe('GitHub repository owner (e.g. "anthropics")'),
        repo: z.string().describe('GitHub repository name (e.g. "claude-code")'),
      },
    },
    async ({ owner, repo }) => {
      const slug = `${owner}/${repo}`;
      try {
        const res = await apiFetch(`/api/skill/${slug}/summary`);
        const data = (await res.json()) as SkillSummaryResponse;
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
                  text: `No completed audit found for ${owner}/${repo}.`,
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
