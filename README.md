# Local Logs MCP Server

A **Model Context Protocol (MCP) server** for monitoring local application logs with real-time tailing, error tracking, and log search capabilities.

Perfect for monitoring Node.js applications, web servers, or any application that writes to log files.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node->=14-green.svg)

## ✨ Features

- 📁 **Log File Discovery** - Automatically finds and lists available log files
- 📜 **Real-time Log Tailing** - Get the last N lines from any log file  
- ⚠️ **Error Monitoring** - Quickly check error logs for issues
- 📊 **Server Status** - Get server status summary from log analysis
- 👀 **Log Watching** - Monitor log files for changes
- 🔍 **Log Search** - Search for specific text patterns in logs
- 🔧 **Configurable** - Supports custom log directories and file extensions
- 🚀 **Easy Setup** - Works with Cursor, Claude Desktop, VS Code Copilot, and more

## 🛠️ Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_log_files` | List available log files with metadata | None |
| `tail_log` | Get last N lines from a log file | `filename`, `lines` |
| `get_errors` | Get recent error log entries | `lines` |
| `get_server_status` | Server status summary from logs | None |
| `watch_log` | Monitor log file for changes | `filename` |
| `search_logs` | Search for text in log files | `query`, `filename`, `lines` |

## 📦 Installation

### 🚀 One-Command Setup (Recommended)

**Linux/Mac:**
```bash
curl -sSL https://raw.githubusercontent.com/mariosss/local-logs-mcp-server/main/install-new.js | node
```

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/mariosss/local-logs-mcp-server/main/install-new.js" | Invoke-Expression
```

**That's it!** The installation script will download the server file directly and configure Cursor automatically. Just restart Cursor and you're ready to go!

### Alternative: Two-Command Setup
```bash
npm install -g https://github.com/mariosss/local-logs-mcp-server
local-logs-setup
```

### Alternative: Manual Setup
```bash
npm install -g local-logs-mcp-server
local-logs-setup
```

### NPX Usage (No Installation)
```bash
npx local-logs-mcp-server
```

### Manual Installation
```bash
git clone https://github.com/mariosss/local-logs-mcp-server.git
cd local-logs-mcp-server
npm install -g .
```

## ⚙️ Configuration

### ✅ Automatic Configuration (Default)

The package automatically configures Cursor for you! No manual setup needed.

### 🔧 Manual Configuration (If needed)

#### For Cursor IDE

Add to your `.cursor/mcp.json` (project-specific) or global MCP config:

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

### For Claude Desktop

Add to your Claude Desktop MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "local-logs": {
      "command": "npx",
      "args": ["-y", "local-logs-mcp-server"],
      "env": {
        "LOGS_DIR": "/path/to/your/logs"
      }
    }
  }
}
```

### For VS Code (GitHub Copilot)

Add to your `.vscode/mcp.json`:

```json
{
  "servers": {
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

### For Windsurf (Codium)

Add to your Windsurf MCP config:

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

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOGS_DIR` | Directory containing log files | Auto-detected (see below) |
| `LOG_EXTENSIONS` | Comma-separated log file extensions | `.log,.txt` |

### Log Directory Auto-Detection

If `LOGS_DIR` is not specified, the server automatically searches for logs in this priority order:

1. `./logs` (current directory)
2. `./apps/backend/logs` (monorepo structure)
3. `./server/logs` (server directory)
4. `./backend/logs` (backend directory)
5. `/var/log` (system logs on Linux/Mac)
6. `C:\logs` (system logs on Windows)

## 📋 Usage Examples

Once configured with your MCP client, you can use natural language commands:

### Basic Commands
- *"Check my server logs"*
- *"Are there any errors in the logs?"*
- *"What's my server status?"*
- *"Show me available log files"*

### Advanced Commands
- *"Show me the last 50 lines from error.log"*
- *"Search logs for 'database connection'"*
- *"Monitor access.log for changes"*
- *"Find all log entries containing 'TypeError'"*

## 🏗️ Project Structure Examples

### Standard Node.js Project
```
your-project/
├── logs/
│   ├── combined.log    # Main application log
│   ├── error.log      # Error log
│   └── access.log     # Access log (optional)
├── .cursor/
│   └── mcp.json       # MCP configuration
├── src/
└── package.json
```

### Monorepo Structure
```
your-monorepo/
├── apps/
│   └── backend/
│       └── logs/
│           ├── combined.log
│           └── error.log
├── .cursor/
│   └── mcp.json
└── package.json
```

## 🔍 Supported Log Formats

The server works with any text-based log files and can parse:

- **Winston logs** (JSON and text format)
- **Morgan access logs**
- **Pino logs**
- **Bunyan logs**
- **Custom application logs**
- **System logs**
- **Any .log or .txt files**

### Example Log Formats

**Winston Text Format:**
```
2024-01-15 10:30:45 [INFO]: Server started on port 3000
2024-01-15 10:30:50 [ERROR]: Database connection failed
```

**Winston JSON Format:**
```json
{"level":"info","message":"Server started","timestamp":"2024-01-15T10:30:45.123Z"}
{"level":"error","message":"Database connection failed","timestamp":"2024-01-15T10:30:50.456Z"}
```

## 🛡️ Security

- **Read-only access** - Server only reads log files, never writes or modifies
- **Directory scoping** - Only accesses files in the specified logs directory
- **No network access** - Operates entirely on local files
- **Permission respect** - Respects file system permissions

## 🚀 Performance

- **Efficient file reading** - Uses streaming for large log files
- **Memory conscious** - Doesn't load entire files into memory
- **Fast search** - Optimized text search algorithms
- **Minimal dependencies** - Only uses Node.js built-in modules

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Server shows red/error status
- Check that the logs directory exists and is accessible
- Verify log files have proper read permissions
- Ensure Node.js version is 14 or higher
- Check that the server path is correct in your MCP config

### No tools available
- Restart your MCP client (Cursor, Claude, VS Code)
- Verify MCP configuration syntax is valid JSON
- Check that the MCP server is responding (test with `echo '{"jsonrpc":"2.0","method":"initialize","id":1}' | npx local-logs-mcp-server`)

### Log files not found
- Set the correct `LOGS_DIR` environment variable
- Make sure your application is actually writing to log files
- Check that file extensions match `LOG_EXTENSIONS` setting
- Verify directory permissions allow reading

### Common Log Directory Issues

**Issue:** "Logs directory not found"
```bash
# Solution: Set explicit path
export LOGS_DIR="/path/to/your/logs"
```

**Issue:** "No log files found"
```bash
# Solution: Check file extensions
export LOG_EXTENSIONS=".log,.txt,.out"
```

## 📚 Examples

### Complete Cursor Setup

1. **Install globally:**
   ```bash
   npm install -g local-logs-mcp-server
   ```

2. **Add to `.cursor/mcp.json`:**
   ```json
   {
     "mcpServers": {
       "local-logs": {
         "command": "local-logs-mcp",
         "env": {
           "LOGS_DIR": "./logs"
         }
       }
     }
   }
   ```

3. **Restart Cursor and test:**
   - Ask: *"Check my server logs"*

### Complete Claude Desktop Setup

1. **Open Claude Desktop config:**
   ```bash
   # Mac
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Windows
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Add configuration:**
   ```json
   {
     "mcpServers": {
       "local-logs": {
         "command": "npx",
         "args": ["-y", "local-logs-mcp-server"],
         "env": {
           "LOGS_DIR": "/Users/yourusername/projects/myapp/logs"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## 🔗 Related Projects

- [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Servers Collection](https://github.com/modelcontextprotocol/servers)
- [Cursor IDE](https://cursor.sh/)
- [Claude Desktop](https://claude.ai/desktop)

---

**Made with ❤️ for the MCP community**

