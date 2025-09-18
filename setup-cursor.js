#!/usr/bin/env node

/**
 * Auto-setup script for Cursor IDE
 * Automatically configures the local-logs MCP server in Cursor settings
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getCursorConfigPath() {
  const homeDir = os.homedir();
  const platform = os.platform();
  
  if (platform === 'win32') {
    return path.join(homeDir, '.cursor', 'mcp.json');
  } else {
    return path.join(homeDir, '.cursor', 'mcp.json');
  }
}

function setupCursor() {
  console.log('🚀 Setting up Local Logs MCP Server for Cursor...\n');
  
  const configPath = getCursorConfigPath();
  const configDir = path.dirname(configPath);
  
  // Ensure .cursor directory exists
  if (!fs.existsSync(configDir)) {
    console.log('📁 Creating .cursor directory...');
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  let config = {};
  
  // Read existing config if it exists
  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configContent);
      console.log('✅ Found existing Cursor MCP configuration');
    } catch (error) {
      console.log('⚠️  Existing config file is invalid, creating new one...');
      config = {};
    }
  } else {
    console.log('📝 Creating new Cursor MCP configuration...');
  }
  
  // Ensure mcpServers object exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  // Check if local-logs is already configured
  if (config.mcpServers['local-logs']) {
    console.log('⚠️  local-logs MCP server is already configured');
    console.log('   Current configuration:');
    console.log(JSON.stringify(config.mcpServers['local-logs'], null, 2));
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n🔄 Do you want to update the configuration? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        updateConfig(config, configPath);
      } else {
        console.log('✅ Keeping existing configuration');
      }
      rl.close();
    });
  } else {
    updateConfig(config, configPath);
  }
}

function updateConfig(config, configPath) {
  // Add local-logs configuration
  const packagePath = path.join(__dirname, 'local-logs-mcp-server.js');
  config.mcpServers['local-logs'] = {
    "command": "node",
    "args": [packagePath],
    "cwd": process.cwd(),
    "env": {
      "LOGS_DIR": "./logs"
    }
  };
  
  // Write updated config
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Successfully configured local-logs MCP server!');
    console.log('📁 Configuration saved to:', configPath);
    console.log('\n🎯 Next steps:');
    console.log('1. Restart Cursor completely');
    console.log('2. Go to Settings > Cursor Settings > MCP & Integrations');
    console.log('3. You should see "local-logs" with a green status');
    console.log('4. Test by asking: "Check my server logs"');
    console.log('\n💡 The server will auto-detect your log directories, or you can set LOGS_DIR environment variable');
  } catch (error) {
    console.error('❌ Failed to write configuration:', error.message);
    process.exit(1);
  }
}

function showManualInstructions() {
  console.log('\n📋 Manual Setup Instructions:');
  console.log('If the auto-setup didn\'t work, you can manually add this to your Cursor MCP config:');
  console.log('\nFile location:', getCursorConfigPath());
  console.log('\nAdd this to the "mcpServers" section:');
  console.log(JSON.stringify({
    "local-logs": {
      "command": "npx",
      "args": ["-y", "local-logs-mcp-server"],
      "env": {
        "LOGS_DIR": "./logs"
      }
    }
  }, null, 2));
}

// Main execution
if (require.main === module) {
  try {
    setupCursor();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    showManualInstructions();
    process.exit(1);
  }
}

module.exports = { setupCursor, getCursorConfigPath };



