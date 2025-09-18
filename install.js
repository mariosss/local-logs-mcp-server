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
  execSync('npm install -g https://github.com/mariosss/local-logs-mcp-server', { stdio: 'inherit' });
  
  console.log('\n✅ Package installed successfully!');
  console.log('🔧 Now configuring Cursor...\n');
  
  // Run the setup script
  execSync('local-logs-setup', { stdio: 'inherit' });
  
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
