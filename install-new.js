#!/usr/bin/env node

/**
 * New Installation script for Local Logs MCP Server
 * Downloads and installs the package directly, then configures Cursor automatically
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

console.log('🚀 Installing Local Logs MCP Server (New Method)...\n');

try {
  // Create installation directory
  const installDir = path.join(os.homedir(), '.local-logs-mcp-server');
  if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true });
  }
  
  console.log('📁 Created installation directory:', installDir);
  
  // Download the main server file
  const serverUrl = 'https://raw.githubusercontent.com/mariosss/local-logs-mcp-server/main/local-logs-mcp-server.js';
  const serverPath = path.join(installDir, 'local-logs-mcp-server.js');
  
  console.log('📥 Downloading server file from:', serverUrl);
  
  const serverFile = fs.createWriteStream(serverPath);
  https.get(serverUrl, (response) => {
    response.pipe(serverFile);
    serverFile.on('finish', () => {
      serverFile.close();
      console.log('✅ Server file downloaded to:', serverPath);
      
      // Configure Cursor
      console.log('🔧 Configuring Cursor...');
      
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
      config.mcpServers['local-logs'] = {
        "command": "node",
        "args": [serverPath],
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
    });
  }).on('error', (err) => {
    console.error('❌ Download failed:', err.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('\n❌ Installation failed:', error.message);
  process.exit(1);
}
