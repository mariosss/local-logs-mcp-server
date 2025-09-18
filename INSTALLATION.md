# 🚀 Local Logs MCP Server - Installation Guide

Quick setup guide for different AI tools and IDEs.

## 🎯 Quick Setup (Recommended)

**The easiest way - just two commands:**

```bash
npm install -g https://github.com/mariosss/local-logs-mcp-server
local-logs-setup
```

**That's it!** The setup script automatically configures Cursor for you. Just restart Cursor and you're ready to go!

## 🎯 Quick Start (NPX - No Installation Required)

The fastest way to use the server without installing it globally:

### Cursor IDE
```json
{
  "mcpServers": {
    "local-logs": {
      "command": "npx",
      "args": ["-y", "local-logs-mcp-server"]
    }
  }
}
```

### Claude Desktop
```json
{
  "mcpServers": {
    "local-logs": {
      "command": "npx",
      "args": ["-y", "local-logs-mcp-server"]
    }
  }
}
```

## 📦 Global Installation

If you prefer to install globally (faster startup):

```bash
npm install -g local-logs-mcp-server
```

Then use:
```json
{
  "mcpServers": {
    "local-logs": {
      "command": "local-logs-mcp"
    }
  }
}
```

## 📁 Configuration File Locations

### Cursor
- **Project-specific**: `.cursor/mcp.json` in your project root
- **Global**: `~/.cursor/mcp.json` (Linux/Mac) or `%USERPROFILE%\.cursor\mcp.json` (Windows)

### Claude Desktop
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

### VS Code (Copilot)
- **Project-specific**: `.vscode/mcp.json` in your project root

## 🔧 Environment Variables

### Basic Setup
```json
{
  "mcpServers": {
    "local-logs": {
      "command": "npx",
      "args": ["-y", "local-logs-mcp-server"],
      "env": {
        "LOGS_DIR": "./logs"
      }
    }
  }
}
```

### Advanced Setup
```json
{
  "mcpServers": {
    "local-logs": {
      "command": "npx", 
      "args": ["-y", "local-logs-mcp-server"],
      "env": {
        "LOGS_DIR": "/path/to/your/logs",
        "LOG_EXTENSIONS": ".log,.txt,.out"
      }
    }
  }
}
```

## ✅ Verify Installation

1. **Restart your AI tool** (Cursor, Claude, etc.)
2. **Check MCP settings** - Look for "local-logs" with green status
3. **Test with a command**: *"Check my server logs"*

## 🐛 Troubleshooting

### Red Status / Server Error
- Check that Node.js is installed (`node --version`)
- Verify the logs directory exists
- Make sure you have read permissions on log files

### No Tools Available  
- Restart your AI tool completely
- Check JSON syntax in MCP config
- Try: `npx local-logs-mcp-server --version` in terminal

### Can't Find Logs
Set explicit path:
```json
"env": {
  "LOGS_DIR": "/absolute/path/to/your/logs"
}
```

## 🎉 Success!

Once working, you can ask your AI assistant:
- *"What's in my server logs?"*
- *"Are there any errors?"*
- *"Show me the last 20 log entries"*
- *"Search logs for 'database connection'"*

