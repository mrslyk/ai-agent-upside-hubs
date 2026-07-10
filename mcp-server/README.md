# Upside Hub MCP Server

Give any AI agent MCP tools to operate a Slyk Upside Hub.

## Setup

```bash
cd mcp-server
npm install
npm run build
```

## Environment

```bash
export SLYK_API_KEY=your_hub_api_key
export UPSIDE_ACCESS_TOKEN=your_platform_access_jwt
export UPSIDE_SITE_URL=https://your-deployed-site.vercel.app
```

## Cursor / Claude Desktop config

```json
{
  "mcpServers": {
    "upsidehubs": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "SLYK_API_KEY": "...",
        "UPSIDE_ACCESS_TOKEN": "..."
      }
    }
  }
}
```

## Tools

| Tool | Economy | Description |
|------|---------|-------------|
| `hub_onboarding` | — | Read operator guide |
| `slyk_list_products` | 1 | List store products |
| `slyk_create_product` | 1 | Add a product |
| `slyk_create_task` | 1 | Post help-wanted task |
| `slyk_complete_task` | 1 | Pay task reward |
| `slyk_transfer_coin` | 1 | Transfer hub coin |
| `request_upside_compliance_review` | 2 | Reg D/CF gate (human principal required) |

Economy 1 tools are unrestricted. Economy 2 triggers premium compliance review.
