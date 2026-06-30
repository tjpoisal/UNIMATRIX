# Unimatrix MCP Setup Guides

Complete guides for connecting your AI tools to Unimatrix via the Model Context Protocol (MCP).

## Overview

Unimatrix provides a unified memory layer that works across all AI tools. Once configured, any connected AI can:

- **Store memories** from conversations using `unimatrix_remember`
- **Recall context** from previous sessions using `unimatrix_recall`  
- **Get recent activity** across all devices using `unimatrix_get_recent`
- **Continue conversations** seamlessly using `unimatrix_continue_from`
- **List available contexts** using `unimatrix_list_contexts`

## Prerequisites

1. **Unimatrix Account**: Sign up at [deployunimatrix.com](https://deployunimatrix.com)
2. **MCP Token**: Generate a token from Settings → MCP Tokens in your dashboard
3. **AI Tool**: One of the supported tools below

---

## Claude Desktop Setup

### Step 1: Generate MCP Token

1. Log into your Unimatrix dashboard
2. Navigate to **Settings** → **MCP Tokens**
3. Click **Generate Token**
4. Choose scope (recommended: `full`)
5. Set expiration (recommended: 365 days)
6. **Copy the token immediately** - it won't be shown again

### Step 2: Configure Claude Desktop

#### macOS/Linux

1. Open your Claude Desktop config directory:
   - **macOS**: `~/Library/Application Support/Claude/`
   - **Linux**: `~/.config/Claude/`

2. Create or edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://unimatrix-mcp.fly.dev/mcp",
      "apiKey": "YOUR_MCP_TOKEN_HERE"
    }
  }
}
```

#### Windows

1. Open your Claude Desktop config directory:
   - **Windows**: `%APPDATA%\Claude\`

2. Create or edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://unimatrix-mcp.fly.dev/mcp",
      "apiKey": "YOUR_MCP_TOKEN_HERE"
    }
  }
}
```

### Step 3: Restart Claude Desktop

1. Completely quit Claude Desktop
2. Reopen the application
3. Claude will automatically detect and connect to Unimatrix

### Step 4: Verify Connection

1. Start a new conversation in Claude Desktop
2. Ask Claude: "What tools do you have available?"
3. You should see Unimatrix tools listed:
   - `unimatrix_remember`
   - `unimatrix_recall`
   - `unimatrix_get_recent`
   - `unimatrix_continue_from`
   - `unimatrix_list_contexts`

### Step 5: Test Memory Storage

Ask Claude to remember something:

```
Please use unimatrix_remember to store this: 
"I'm working on a React project using Next.js and TypeScript. 
The project is called Unimatrix and it's an AI memory system."
```

### Step 6: Test Memory Retrieval

In a new conversation, ask Claude to recall:

```
Please use unimatrix_recall to find information about my React project.
```

---

## Cursor IDE Setup

### Step 1: Generate MCP Token

Follow the same steps as Claude Desktop (Step 1 above)

### Step 2: Configure Cursor

#### Option A: Cursor Settings (Recommended)

1. Open Cursor IDE
2. Go to **Settings** → **MCP Servers**
3. Click **Add Server**
4. Configure:
   - **Name**: `unimatrix`
   - **URL**: `https://unimatrix-mcp.fly.dev/mcp`
   - **API Key**: `YOUR_MCP_TOKEN_HERE`
5. Click **Save**

#### Option B: Manual Config File

1. Locate your Cursor config directory:
   - **macOS**: `~/Library/Application Support/Cursor/`
   - **Linux**: `~/.config/Cursor/`
   - **Windows**: `%APPDATA%\Cursor\`

2. Create or edit `mcp_config.json`:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://unimatrix-mcp.fly.dev/mcp",
      "apiKey": "YOUR_MCP_TOKEN_HERE"
    }
  }
}
```

### Step 3: Restart Cursor

1. Completely quit Cursor IDE
2. Reopen the application

### Step 4: Verify Connection

1. Open a new chat in Cursor
2. Type: `@unimatrix` (you should see autocomplete)
3. Ask: "What can you help me remember?"
4. Cursor should show available Unimatrix tools

### Step 5: Test Integration

In your codebase, try:

```
@unimatrix Remember that I'm using TypeScript strict mode and 
prefer functional components over class components.
```

Then in another session:

```
@unimatrix Recall my TypeScript preferences
```

---

## Windsurf Setup

### Step 1: Generate MCP Token

Follow the same steps as Claude Desktop (Step 1 above)

### Step 2: Configure Windsurf

1. Open Windsurf
2. Go to **Settings** → **Integrations** → **MCP**
3. Click **Add MCP Server**
4. Configure:
   - **Server Name**: `unimatrix`
   - **Endpoint**: `https://unimatrix-mcp.fly.dev/mcp`
   - **Authentication**: Bearer Token
   - **Token**: `YOUR_MCP_TOKEN_HERE`
5. Click **Connect**

### Step 3: Test Connection

1. Open a new Windsurf workspace
2. In the AI chat, type: `/mcp`
3. You should see `unimatrix` listed as available
4. Test with: `@unimatrix Remember this project uses Tailwind CSS`

---

## Continue.dev Setup

### Step 1: Generate MCP Token

Follow the same steps as Claude Desktop (Step 1 above)

### Step 2: Configure Continue.dev

1. Open your Continue.dev config file:
   - **Location**: `~/.continue/config.json` (macOS/Linux)
   - **Windows**: `%USERPROFILE%\.continue\config.json`

2. Add the MCP server configuration:

```json
{
  "mcpServers": [
    {
      "name": "unimatrix",
      "url": "https://unimatrix-mcp.fly.dev/mcp",
      "apiKey": "YOUR_MCP_TOKEN_HERE"
    }
  ]
}
```

### Step 3: Restart Continue.dev

1. Restart your editor (VS Code, JetBrains, etc.)
2. Continue.dev will load the MCP configuration

### Step 4: Test Integration

In your Continue.dev chat:

```
@unimatrix Remember that I'm working on a Node.js project 
with Express and PostgreSQL
```

---

## Custom MCP Client Setup

If you're building a custom MCP client or using a different tool:

### Basic MCP Client Configuration

```javascript
const mcpConfig = {
  servers: {
    unimatrix: {
      url: "https://unimatrix-mcp.fly.dev/mcp",
      apiKey: "YOUR_MCP_TOKEN_HERE"
    }
  }
};
```

### Authentication Headers

All MCP requests should include:

```
Authorization: Bearer YOUR_MCP_TOKEN_HERE
Content-Type: application/json
```

### Available Tools

#### `unimatrix_remember`
Store a memory from the current conversation.

**Parameters:**
- `content` (string, required): The content to remember
- `context` (string, optional): Additional context about the memory
- `tags` (array, optional): Tags for categorization

**Example:**
```json
{
  "content": "User prefers Python for data analysis",
  "context": "Programming preferences",
  "tags": ["python", "data-analysis", "preferences"]
}
```

#### `unimatrix_recall`
Search across all memories from all LLMs and devices.

**Parameters:**
- `query` (string, required): Natural language search query
- `limit` (number, optional): Max results (default: 8)
- `spaceId` (string, optional): Scope to specific workspace
- `profile` (string, optional): "desktop" or "mobile"

**Example:**
```json
{
  "query": "programming language preferences",
  "limit": 5
}
```

#### `unimatrix_get_recent`
Get the most recent memories across all LLMs.

**Parameters:**
- `limit` (number, optional): Number of recent memories (default: 10)
- `profile` (string, optional): "desktop" or "mobile"

**Example:**
```json
{
  "limit": 20
}
```

#### `unimatrix_continue_from`
Retrieve full context from a prior session.

**Parameters:**
- `session_id` (string, optional): Specific session ID to continue from
- `limit` (number, optional): Number of memories (default: 20)

**Example:**
```json
{
  "session_id": "workspace-uuid-here",
  "limit": 30
}
```

#### `unimatrix_list_contexts`
List all available memory workspaces.

**Parameters:** None

**Example:**
```json
{}
```

---

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to MCP server"

**Solutions**:
1. Verify your MCP token is valid and not expired
2. Check that you're using the correct URL: `https://unimatrix-mcp.fly.dev/mcp`
3. Ensure your internet connection is stable
4. Try regenerating your MCP token

### Authentication Errors

**Problem**: "Unauthorized" or "Invalid token"

**Solutions**:
1. Verify you copied the entire token (no extra spaces)
2. Check if the token has been revoked in your dashboard
3. Generate a new token if needed
4. Ensure you're using the token as a Bearer token

### Tools Not Showing Up

**Problem**: MCP tools not available in AI client

**Solutions**:
1. Restart your AI client completely
2. Check the MCP server is running: `https://unimatrix-mcp.fly.dev/health`
3. Verify your config file syntax is correct
4. Check AI client logs for MCP connection errors

### Memory Not Being Stored

**Problem**: `unimatrix_remember` seems to work but memories don't appear

**Solutions**:
1. Check your token has appropriate scope (not `readonly`)
2. Verify memory appears in your Unimatrix dashboard
3. Check for error messages in the AI client
4. Ensure the content being stored is not empty

### Recall Returns No Results

**Problem**: `unimatrix_recall` returns empty results

**Solutions**:
1. Verify you have stored memories using `unimatrix_remember`
2. Try a broader search query
3. Check that memories are indexed (may take a few seconds)
4. Use `unimatrix_get_recent` to verify memories exist

---

## Advanced Configuration

### Self-Hosted MCP Server

If you're running Unimatrix self-hosted:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "http://your-server:PORT/mcp",
      "apiKey": "YOUR_MCP_TOKEN_HERE"
    }
  }
}
```

### Custom Scopes

Generate tokens with specific scopes:

- **`full`**: Read and write access to all memories
- **`readonly`**: Can only recall and list, not store
- **`memory_only`**: Can store and recall, no administrative functions

### Token Expiration

- **Short-term**: 7-30 days for testing
- **Standard**: 365 days for regular use
- **Long-term**: Custom expiration for production deployments

---

## Security Best Practices

1. **Never share tokens**: Treat MCP tokens like passwords
2. **Use appropriate scopes**: Don't use `full` scope if `readonly` suffices
3. **Rotate tokens regularly**: Regenerate tokens periodically
4. **Revoke unused tokens**: Clean up tokens from old devices
5. **Monitor usage**: Check token usage in your dashboard
6. **Use environment variables**: Don't hardcode tokens in config files

---

## MCP Tool Reference

### Memory Storage Flow

```
User Conversation → AI Client → unimatrix_remember → Unimatrix Server → Database
```

### Memory Retrieval Flow

```
User Query → AI Client → unimatrix_recall → Unimatrix Server → Semantic Search → Results
```

### Cross-LLM Handoff

```
ChatGPT Session → unimatrix_remember → Claude Session → unimatrix_get_recent → Context Transfer
```

---

## Getting Help

- **Documentation**: [docs.unimatrix.com](https://docs.unimatrix.com)
- **Support**: support@unimatrix.com
- **GitHub Issues**: [github.com/tjpoisal/UNIMATRIX/issues](https://github.com/tjpoisal/UNIMATRIX/issues)
- **Community**: [Discord](https://discord.gg/unimatrix)

---

## FAQ

**Q: Can I use multiple MCP servers?**
A: Yes, you can configure multiple MCP servers in your AI client. Unimatrix will work alongside other MCP tools.

**Q: Is my data encrypted?**
A: Yes, all memories are encrypted client-side before storage. The server never sees plaintext content.

**Q: Can I access memories from multiple devices?**
A: Yes, memories are synchronized across all devices connected to your Unimatrix account.

**Q: What happens if I lose my MCP token?**
A: You can revoke the old token and generate a new one from your dashboard. Old memories remain accessible.

**Q: Is there a limit on how many memories I can store?**
A: Free tier: 1,000 memories. Pro tier: Unlimited memories.

**Q: Can I export my memories?**
A: Yes, you can export memories from your dashboard in JSON format.

---

**Last Updated**: 2026-06-29
**Version**: 1.0.0
