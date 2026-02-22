import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiFetch, ApiError } from '../lib/client.js';
import type { SearchResponse } from '../lib/types.js';

export function registerSearchAudits(server: McpServer): void {
  server.registerTool(
    'search_audits',
    {
      description:
        'Search completed Oathe security audits. ' +
        'Filter by verdict and minimum trust score. ' +
        'Returns up to 100 completed audits. ' +
        'Results are currently a flat array; a pagination wrapper may be added in a future API update.',
      inputSchema: {
        verdict: z
          .enum(['SAFE', 'CAUTION', 'DANGEROUS', 'MALICIOUS'])
          .optional()
          .describe('Filter by audit verdict'),
        min_score: z
          .number()
          .int()
          .min(0)
          .max(100)
          .optional()
          .describe('Minimum trust score (0-100)'),
        sort: z
          .enum(['created_at', 'trust_score', 'skill_slug'])
          .optional()
          .describe('Sort field (default: created_at)'),
        order: z
          .enum(['ASC', 'DESC'])
          .optional()
          .describe('Sort order (default: DESC)'),
      },
    },
    async ({ verdict, min_score, sort, order }) => {
      const params = new URLSearchParams();
      if (verdict) params.set('verdict', verdict);
      if (min_score !== undefined) params.set('min_score', String(min_score));
      if (sort) params.set('sort', sort);
      if (order) params.set('order', order);

      const query = params.toString();
      const path = query ? `/api/audits/search?${query}` : '/api/audits/search';

      try {
        const res = await apiFetch(path);
        const data = (await res.json()) as SearchResponse;
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        if (err instanceof ApiError) {
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
