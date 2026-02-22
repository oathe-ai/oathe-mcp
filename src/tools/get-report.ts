import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiFetch, ApiError } from '../lib/client.js';
import type { SkillReport } from '../lib/types.js';

export function registerGetReport(server: McpServer): void {
  server.registerTool(
    'get_audit_report',
    {
      description:
        'Get the full behavioral security audit report for a GitHub repository. ' +
        'Use this to review all findings before installing a third-party MCP server, plugin, or tool. ' +
        'Returns the latest completed audit with trust score, verdict, findings, ' +
        'category scores, and recommendation. ' +
        'Use get_skill_summary for a quick safety check instead.',
      inputSchema: {
        owner: z.string().describe('GitHub repository owner (e.g. "anthropics")'),
        repo: z.string().describe('GitHub repository name (e.g. "claude-code")'),
      },
    },
    async ({ owner, repo }) => {
      const slug = `${owner}/${repo}`;
      try {
        const res = await apiFetch(`/api/skill/${slug}/latest`);
        const data = (await res.json()) as { report: SkillReport };
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify(data.report, null, 2) },
          ],
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
