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

function detectProjectDirectory() {
  // Common project directory patterns to look for
  const commonPatterns = [
    'gptcreatorai_V3',
    'gptcreatorai',
    'my-project',
    'app',
    'backend',
    'server'
  ];
  
  // Start from common development directories
  const searchPaths = [
    path.join(os.homedir(), 'source', 'repos'),
    path.join(os.homedir(), 'Documents', 'Projects'),
    path.join(os.homedir(), 'Projects'),
    path.join(os.homedir(), 'dev'),
    path.join(os.homedir(), 'code'),
    process.cwd() // Current working directory as fallback
  ];
  
  // Look for directories that might contain logs
  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      try {
        const entries = fs.readdirSync(searchPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const dirPath = path.join(searchPath, entry.name);
            
            // Check if this directory has a logs folder or common project structure
            const hasLogs = fs.existsSync(path.join(dirPath, 'logs')) ||
                           fs.existsSync(path.join(dirPath, 'apps', 'backend', 'logs')) ||
                           fs.existsSync(path.join(dirPath, 'server', 'logs')) ||
                           fs.existsSync(path.join(dirPath, 'backend', 'logs'));
            
            if (hasLogs) {
              console.log(`🎯 Detected project directory: ${dirPath}`);
              return dirPath;
            }
            
            // Also check for common project names
            if (commonPatterns.some(pattern => entry.name.toLowerCase().includes(pattern.toLowerCase()))) {
              console.log(`🎯 Detected project directory: ${dirPath}`);
              return dirPath;
            }
          }
        }
      } catch (error) {
        // Continue searching if we can't read this directory
        continue;
      }
    }
  }
  
  // Fallback to current working directory
  console.log(`⚠️  Using current directory as fallback: ${process.cwd()}`);
  return process.cwd();
}

function detectLogsDirectory(projectDir) {
  // Check for common log directory structures
  const logPaths = [
    'apps/backend/logs',    // Monorepo structure (like gptcreatorai_V3)
    'server/logs',          // Simple server structure
    'backend/logs',         // Backend-only structure
    'logs',                 // Root logs directory
    'app/logs',             // App structure
    'src/logs'              // Source structure
  ];
  
  for (const logPath of logPaths) {
    const fullPath = path.join(projectDir, logPath);
    if (fs.existsSync(fullPath)) {
      console.log(`📁 Detected logs directory: ${logPath}`);
      return logPath;
    }
  }
  
  // Fallback to ./logs
  console.log(`📁 Using default logs directory: ./logs`);
  return './logs';
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
  
  // Try to detect the user's project directory
  const projectDir = detectProjectDirectory();
  
  // Detect the best LOGS_DIR based on project structure
  const logsDir = detectLogsDirectory(projectDir);
  
  config.mcpServers['local-logs'] = {
    "command": "node",
    "args": [packagePath],
    "cwd": projectDir,
    "env": {
      "LOGS_DIR": logsDir
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



