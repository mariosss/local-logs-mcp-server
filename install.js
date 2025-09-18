#!/usr/bin/env node

/**
 * Installation script for Local Logs MCP Server
 * Downloads and installs the package, then configures Cursor automatically
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Installing Local Logs MCP Server...\n');

try {
  // Install the package
  console.log('📦 Installing package from GitHub...');
  execSync('npm install -g https://github.com/mariosss/local-logs-mcp-server --ignore-scripts', { stdio: 'inherit' });
  
  console.log('\n✅ Package installed successfully!');
  console.log('🔧 Now configuring Cursor...\n');
  
  // Manual configuration (always do this since setup script has issues)
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  const configPath = path.join(os.homedir(), '.cursor', 'mcp.json');
  const configDir = path.dirname(configPath);
  
  // Ensure .cursor directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      config = {};
    }
  }
  
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  // Add local-logs configuration
  const packagePath = path.join(os.homedir(), 'AppData', 'Roaming', 'npm', 'node_modules', 'local-logs-mcp-server', 'local-logs-mcp-server.js');
  config.mcpServers['local-logs'] = {
    "command": "node",
    "args": [packagePath],
    "cwd": process.cwd(),
    "env": {
      "LOGS_DIR": "./logs"
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Cursor configuration updated!');
  
  console.log('\n🎉 Installation complete!');
  console.log('🎯 Next steps:');
  console.log('1. Restart Cursor completely');
  console.log('2. Go to Settings > Cursor Settings > MCP & Integrations');
  console.log('3. You should see "local-logs" with a green status');
  console.log('4. Test by asking: "Check my server logs"');
  
} catch (error) {
  console.error('\n❌ Installation failed:', error.message);
  console.log('\n🔧 Manual installation:');
  console.log('1. npm install -g https://github.com/mariosss/local-logs-mcp-server');
  console.log('2. local-logs-setup');
  process.exit(1);
}
