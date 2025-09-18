#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Local Logs MCP Server
 * Implements the Model Context Protocol for monitoring local server logs
 */
class LocalLogsMCPServer {
  constructor() {
    // Configure logs directory from environment variable or default paths
    this.logsDir = this.getLogsDirectory();
    this.logExtensions = (process.env.LOG_EXTENSIONS || '.log,.txt').split(',').map(ext => ext.trim());
    
    // Bind methods to preserve 'this' context
    this.handleMessage = this.handleMessage.bind(this);
    this.sendResponse = this.sendResponse.bind(this);
    this.sendError = this.sendError.bind(this);
  }

  getLogsDirectory() {
    // Priority order for finding logs directory
    const possiblePaths = [
      process.env.LOGS_DIR,                                    // User specified
      path.join(process.cwd(), 'logs'),                       // ./logs from current directory
      path.join(process.cwd(), 'apps', 'backend', 'logs'),    // For monorepo structures
      path.join(process.cwd(), 'server', 'logs'),             // Common server structure
      path.join(process.cwd(), 'backend', 'logs'),            // Simple backend structure
      '/var/log',                                             // System logs (Linux/Mac)
      'C:\\logs'                                              // System logs (Windows)
    ].filter(Boolean);

    for (const logPath of possiblePaths) {
      if (fs.existsSync(logPath)) {
        return path.resolve(logPath);
      }
    }

    // Default to ./logs and create if it doesn't exist
    const defaultPath = path.join(process.cwd(), 'logs');
    return path.resolve(defaultPath);
  }

  start() {
    // Set up JSON-RPC communication over stdio
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        const lines = chunk.trim().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line);
              this.handleMessage(message);
            } catch (error) {
              this.sendError(null, -32700, 'Parse error', error.message);
            }
          }
        }
      }
    });

    process.stdin.on('end', () => {
      process.exit(0);
    });
  }

  async handleMessage(message) {
    const { id, method, params } = message;

    try {
      switch (method) {
        case 'initialize':
          this.sendResponse(id, {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'local-logs-mcp-server',
              version: '1.0.0'
            }
          });
          break;

        case 'notifications/initialized':
          // No response needed for notifications
          break;

        case 'tools/list':
          this.sendResponse(id, {
            tools: [
              {
                name: 'get_log_files',
                description: 'Get list of available log files with metadata',
                inputSchema: {
                  type: 'object',
                  properties: {},
                  required: []
                }
              },
              {
                name: 'tail_log',
                description: 'Get the last N lines from a log file',
                inputSchema: {
                  type: 'object',
                  properties: {
                    filename: {
                      type: 'string',
                      description: 'Name of the log file (default: combined.log)',
                      default: 'combined.log'
                    },
                    lines: {
                      type: 'number',
                      description: 'Number of lines to return (default: 50)',
                      default: 50
                    }
                  },
                  required: []
                }
              },
              {
                name: 'get_errors',
                description: 'Get recent error log entries',
                inputSchema: {
                  type: 'object',
                  properties: {
                    lines: {
                      type: 'number',
                      description: 'Number of error lines to return (default: 20)',
                      default: 20
                    }
                  },
                  required: []
                }
              },
              {
                name: 'get_server_status',
                description: 'Get server status summary from logs',
                inputSchema: {
                  type: 'object',
                  properties: {},
                  required: []
                }
              },
              {
                name: 'watch_log',
                description: 'Monitor a log file for changes',
                inputSchema: {
                  type: 'object',
                  properties: {
                    filename: {
                      type: 'string',
                      description: 'Name of the log file to monitor (default: combined.log)',
                      default: 'combined.log'
                    }
                  },
                  required: []
                }
              },
              {
                name: 'search_logs',
                description: 'Search for specific text in log files',
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: 'Text to search for in logs'
                    },
                    filename: {
                      type: 'string',
                      description: 'Log file to search (default: combined.log)',
                      default: 'combined.log'
                    },
                    lines: {
                      type: 'number',
                      description: 'Number of matching lines to return (default: 10)',
                      default: 10
                    }
                  },
                  required: ['query']
                }
              }
            ]
          });
          break;

        case 'tools/call':
          await this.handleToolCall(id, params);
          break;

        default:
          this.sendError(id, -32601, 'Method not found', `Unknown method: ${method}`);
      }
    } catch (error) {
      this.sendError(id, -32603, 'Internal error', error.message);
    }
  }

  async handleToolCall(id, params) {
    const { name, arguments: args } = params;

    try {
      let result;

      switch (name) {
        case 'get_log_files':
          result = this.getLogFiles();
          break;

        case 'tail_log':
          result = this.tailLog(args?.filename, args?.lines);
          break;

        case 'get_errors':
          result = this.getErrors(args?.lines);
          break;

        case 'get_server_status':
          result = this.getServerStatus();
          break;

        case 'watch_log':
          result = this.watchLog(args?.filename);
          break;

        case 'search_logs':
          result = this.searchLogs(args?.query, args?.filename, args?.lines);
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      this.sendResponse(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      });
    } catch (error) {
      this.sendError(id, -32603, 'Tool execution failed', error.message);
    }
  }

  getLogFiles() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        return { 
          files: [], 
          message: 'Logs directory not found. Server might be in development mode (console only).',
          logsDir: this.logsDir
        };
      }
      
      const files = fs.readdirSync(this.logsDir)
        .filter(file => this.logExtensions.some(ext => file.endsWith(ext)))
        .map(file => {
          const filePath = path.join(this.logsDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            sizeHuman: this.formatBytes(stats.size),
            modified: stats.mtime.toISOString(),
            path: filePath
          };
        })
        .sort((a, b) => new Date(b.modified) - new Date(a.modified));
      
      return { 
        files, 
        message: `Found ${files.length} log files`,
        logsDir: this.logsDir
      };
    } catch (error) {
      return { files: [], error: error.message };
    }
  }

  tailLog(filename = 'combined.log', lines = 50) {
    try {
      const filePath = path.join(this.logsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return { 
          content: '', 
          message: `Log file ${filename} not found. Available files: ${this.getLogFiles().files.map(f => f.name).join(', ')}`,
          filename,
          lines: 0
        };
      }

      let content;
      try {
        if (process.platform === 'win32') {
          const fullContent = fs.readFileSync(filePath, 'utf8');
          const allLines = fullContent.split('\n');
          content = allLines.slice(-lines).join('\n');
        } else {
          content = execSync(`tail -n ${lines} "${filePath}"`, { encoding: 'utf8' });
        }
      } catch (cmdError) {
        const fullContent = fs.readFileSync(filePath, 'utf8');
        const allLines = fullContent.split('\n');
        content = allLines.slice(-lines).join('\n');
      }

      const actualLines = content.split('\n').filter(line => line.trim()).length;

      return { 
        content, 
        message: `Last ${actualLines} lines from ${filename}`,
        filename,
        lines: actualLines,
        fileSize: fs.statSync(filePath).size,
        fileSizeHuman: this.formatBytes(fs.statSync(filePath).size)
      };
    } catch (error) {
      return { content: '', error: error.message, filename };
    }
  }

  getErrors(lines = 20) {
    const result = this.tailLog('error.log', lines);
    return {
      ...result,
      message: result.content ? `Found ${result.lines} error entries` : 'No errors found'
    };
  }

  getServerStatus() {
    try {
      const combinedResult = this.tailLog('combined.log', 10);
      const errorResult = this.tailLog('error.log', 5);
      
      const recentLogs = combinedResult.content ? 
        combinedResult.content.split('\n').filter(line => line.trim()).slice(-5) : [];
      
      const recentErrors = errorResult.content ? 
        errorResult.content.split('\n').filter(line => line.trim()) : [];

      // Analyze logs for server status
      let status = 'unknown';
      if (recentLogs.some(log => log.includes('Worker') && log.includes('ready'))) {
        status = 'running';
      } else if (recentLogs.some(log => log.includes('error') || log.includes('Error'))) {
        status = 'error';
      } else if (recentLogs.length > 0) {
        status = 'active';
      }

      return {
        status,
        recentLogs,
        recentErrors,
        errorCount: recentErrors.length,
        logsAvailable: combinedResult.content ? true : false,
        lastActivity: recentLogs.length > 0 ? 'recently active' : 'no recent activity',
        message: combinedResult.message || 'No logs available'
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  watchLog(filename = 'combined.log') {
    try {
      const filePath = path.join(this.logsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return { 
          watching: false, 
          message: `Log file ${filename} not found`,
          filename 
        };
      }

      const stats = fs.statSync(filePath);
      return { 
        watching: true, 
        file: filename,
        size: stats.size,
        sizeHuman: this.formatBytes(stats.size),
        lastModified: stats.mtime.toISOString(),
        message: `Monitoring ${filename} for changes`
      };
    } catch (error) {
      return { watching: false, error: error.message, filename };
    }
  }

  searchLogs(query, filename = 'combined.log', maxLines = 10) {
    try {
      const filePath = path.join(this.logsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return { 
          matches: [], 
          message: `Log file ${filename} not found`,
          query,
          filename 
        };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const matches = [];

      for (let i = 0; i < lines.length && matches.length < maxLines; i++) {
        if (lines[i].toLowerCase().includes(query.toLowerCase())) {
          matches.push({
            lineNumber: i + 1,
            content: lines[i].trim(),
            timestamp: this.extractTimestamp(lines[i])
          });
        }
      }

      return {
        matches,
        query,
        filename,
        matchCount: matches.length,
        message: `Found ${matches.length} matches for "${query}" in ${filename}`
      };
    } catch (error) {
      return { matches: [], error: error.message, query, filename };
    }
  }

  extractTimestamp(logLine) {
    const timestampMatch = logLine.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    return timestampMatch ? timestampMatch[0] : null;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  sendResponse(id, result) {
    const response = {
      jsonrpc: '2.0',
      id,
      result
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }

  sendError(id, code, message, data) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data
      }
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }
}

// Start the MCP server
if (require.main === module) {
  const server = new LocalLogsMCPServer();
  server.start();
}

module.exports = LocalLogsMCPServer;


