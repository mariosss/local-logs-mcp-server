# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-09-18

### Added
- Initial release of Local Logs MCP Server
- **6 MCP tools** for comprehensive log monitoring:
  - `get_log_files` - List available log files with metadata
  - `tail_log` - Get last N lines from any log file  
  - `get_errors` - Quick error log checking
  - `get_server_status` - Server status analysis from logs
  - `watch_log` - Monitor log files for changes
  - `search_logs` - Search for specific text in logs

### Features
- **Auto-detection** of log directories (supports multiple project structures)
- **Configurable** log extensions via environment variables
- **Cross-platform** support (Windows, macOS, Linux)
- **Memory efficient** streaming for large log files
- **Read-only** access for security
- **Human-readable** file sizes and timestamps
- **JSON-RPC 2.0** compliant MCP protocol implementation

### Supported Integrations
- Cursor IDE
- Claude Desktop
- VS Code with GitHub Copilot
- Windsurf (Codium)
- Any MCP-compatible client

### Configuration
- `LOGS_DIR` environment variable for custom log directory
- `LOG_EXTENSIONS` for custom file extensions
- Auto-detection fallbacks for common project structures

### Documentation
- Complete README with usage examples
- Installation guide for different IDEs
- Troubleshooting section
- MIT License

## [Unreleased]

### Planned
- Real-time log streaming with WebSocket support
- Log file rotation detection and handling
- Advanced search with regex support
- Log parsing for structured formats (JSON, CSV)
- Performance metrics and statistics
- Multi-directory support
- Log file compression support

---

## Release Notes Template

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes in existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security improvements





