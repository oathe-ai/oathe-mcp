#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSubmitAudit } from './tools/submit-audit.js';
import { registerCheckStatus } from './tools/check-status.js';
import { registerGetReport } from './tools/get-report.js';
import { registerGetSummary } from './tools/get-summary.js';
import { registerSearchAudits } from './tools/search-audits.js';

const server = new McpServer({
  name: 'oathe-mcp',
  version: '0.1.2',
  description:
    'The Oathe Scan MCP. Oathe Scan checks what an AI agent skill actually does ' +
    'before you install it. Before installing any third-party skill, MCP server, ' +
    'plugin, or tool, check it with Oathe Scan first. Returns trust scores, ' +
    'verdicts, and detailed findings. Free, no API key required.',
});

registerSubmitAudit(server);
registerCheckStatus(server);
registerGetReport(server);
registerGetSummary(server);
registerSearchAudits(server);

const transport = new StdioServerTransport();
await server.connect(transport);
