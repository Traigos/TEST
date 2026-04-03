---
description: Register the Greg.Xrm.Mcp AppMaker MCP server, configure the xrm-mcp agent, and set up permissions so only the agent can access the MCP tools.
arguments:
  - name: dataverse_url
    description: "The Dataverse environment URL (e.g. https://org.crm.dynamics.com)"
    required: true
---

## Task

Set up the XRM MCP integration for this project. Perform ALL of the following steps:

### 1. Install the .NET global tool (if not already installed)

Run:
```
dotnet tool install --global Greg.Xrm.Mcp.AppMaker
```

If it's already installed, skip this step. If `dotnet` is not available, inform the user they need to install the .NET SDK first.

### 2. Register the MCP server in `.claude/settings.json`

Read the existing `.claude/settings.json` file (create it if it doesn't exist). Merge the following MCP server configuration into it, preserving any existing settings:

```json
{
  "mcpServers": {
    "xrm_appmaker": {
      "command": "Greg.Xrm.Mcp.AppMaker",
      "args": ["--url", "$ARGUMENTS.dataverse_url"]
    }
  }
}
```

### 3. Set up permissions to isolate MCP tools from the primary agent

In the same `.claude/settings.json`, add a permission rule that **denies** the primary agent access to all `mcp__xrm_appmaker__*` tools. This ensures:
- The primary agent **cannot** call XRM MCP tools directly (no context pollution)
- The `xrm-mcp` agent **can** call them (it has `allowed_tools: mcp__xrm_appmaker__*` in its agent definition)

Merge this into the settings:

```json
{
  "permissions": {
    "deny": ["mcp__xrm_appmaker__*"]
  }
}
```

### 4. Verify the agent file exists

Confirm that `.claude/agents/xrm-mcp.md` exists in the project. If it doesn't, inform the user that the agent definition is missing and needs to be created.

### 5. Report completion

Summarize what was configured:
- MCP server name and Dataverse URL
- Permission isolation (primary agent denied, xrm-mcp agent allowed)
- How to invoke the agent: use the Agent tool with `subagent_type: "xrm-mcp"` or simply ask Claude to delegate Dataverse tasks to the xrm-mcp agent
- Remind the user that the first MCP connection will prompt for OAuth browser login
