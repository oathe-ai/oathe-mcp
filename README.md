# Oathe Scan MCP

Installing a skill for your AI agent? Oathe Scan checks what it actually does before you install it.

`oathe-mcp` is the MCP server for [Oathe Scan](https://oathe.ai/scan/). Your agent can look up a skill, MCP server or plugin, or submit one for an audit, and get back a trust score, a verdict and findings. Free. No account needed for 10 scans a month. Set `OATHE_API_KEY` to a free API key for 200.

## Quick start

```bash
npx oathe-mcp
```

Needs Node 18 or later. Nothing to configure. An API key is optional.

## Add it to your agent

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "oathe-scan": {
      "command": "npx",
      "args": ["-y", "oathe-mcp"]
    }
  }
}
```

Optional. If you have a free API key, pass it in `env`:

```json
{
  "mcpServers": {
    "oathe-scan": {
      "command": "npx",
      "args": ["-y", "oathe-mcp"],
      "env": { "OATHE_API_KEY": "your-api-key" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add oathe-scan -- npx -y oathe-mcp
```

Optional. With a free API key:

```bash
claude mcp add oathe-scan -e OATHE_API_KEY=your-api-key -- npx -y oathe-mcp
```

### Other MCP clients

Any client that runs a local MCP server over stdio uses the same command: `npx -y oathe-mcp`. To use an API key, set `OATHE_API_KEY` in the environment the client gives the server.

We name it `oathe-scan` so it doesn't collide with `oathe`, the MCP server that [Oathe](https://github.com/oathe-ai/oathe) sets up.

## Tools

### submit_audit

Submit a GitHub or ClawHub URL for an audit.

```json
{ "skill_url": "https://github.com/owner/repo" }
```

Returns an `audit_id` to track progress. Optional: `notification_email`, `force_rescan`.

One submission per 60 seconds. No account needed for 10 scans a month. Set `OATHE_API_KEY` to a free API key for 200 a month. [Sign up](https://oathe.ai/signup/) to get one. More on [rate limits](https://oathe.ai/docs/rate-limits/).

### check_audit_status

Check the status of a submitted audit.

```json
{ "audit_id": "uuid-from-submit" }
```

An audit takes about two minutes. Wait 90 seconds, then poll every 10 seconds. Terminal statuses: `complete`, `failed`.

### get_audit_report

Get the full audit report for a repository.

```json
{ "owner": "anthropics", "repo": "claude-code" }
```

Returns trust score, verdict, findings, category scores, and recommendation.

### get_skill_summary

Get a short summary (score and verdict) without the full findings.

```json
{ "owner": "anthropics", "repo": "claude-code" }
```

Returns score, verdict, recommendation, and finding counts.

### search_audits

Search completed audits by verdict or minimum trust score.

```json
{ "verdict": "SAFE", "min_score": 80, "sort": "trust_score", "order": "DESC" }
```

Returns up to 100 results.

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `OATHE_API_BASE` | `https://audit-engine.oathe.ai` | Override the API base URL |
| `OATHE_API_KEY` | none | Optional. A free API key. Scans count against 200 a month instead of 10 |

Without `OATHE_API_KEY` the server sends no key and you get 10 scans a month. With it, each request carries `Authorization: Bearer <key>`. Get a free key at [oathe.ai/signup](https://oathe.ai/signup/). The server never prints the key.

An invalid `OATHE_API_BASE` stops the server at startup with an error that names the value.

## About Oathe

Everyone already has an agent. Oathe is a way for them to work together. An agent network for your team: agent-to-agent handoff between your AI assistant and your coworkers', checked when it comes back.

Oathe Scan is part of Oathe. Oathe is open source ([`@oathe/oathe`](https://github.com/oathe-ai/oathe)) and free. [Oathe Cloud](https://oathe.ai/cloud/) is free in beta, with a waitlist.

## License

MIT
