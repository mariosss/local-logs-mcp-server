#!/usr/bin/env node

/**
 * Test script for the Local Logs MCP Server
 * This script tests all the MCP tools to ensure they work correctly
 */

const { spawn } = require('child_process');
const path = require('path');

function testMCPServer() {
  console.log('🧪 Testing Local Logs MCP Server...\n');
  
  const serverPath = path.join(__dirname, 'local-logs-mcp-server.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let responseBuffer = '';
  let testsPassed = 0;
  let totalTests = 0;

  server.stdout.on('data', (data) => {
    responseBuffer += data.toString();
    
    // Process complete JSON-RPC messages
    const lines = responseBuffer.split('\n');
    responseBuffer = lines.pop(); // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          handleResponse(response);
        } catch (error) {
          console.log('📨 Raw output:', line);
        }
      }
    }
  });

  server.stderr.on('data', (data) => {
    console.error('❌ Error:', data.toString());
  });

  function handleResponse(response) {
    totalTests++;
    
    if (response.error) {
      console.log(`❌ Test ${totalTests} failed:`, response.error.message);
    } else {
      testsPassed++;
      
      switch (totalTests) {
        case 1:
          console.log('✅ Initialize test passed');
          if (response.result && response.result.serverInfo) {
            console.log(`   Server: ${response.result.serverInfo.name} v${response.result.serverInfo.version}`);
          }
          break;
        case 2:
          console.log('✅ Tools list test passed');
          if (response.result && response.result.tools) {
            console.log(`   Found ${response.result.tools.length} tools:`);
            response.result.tools.forEach((tool, i) => {
              console.log(`   ${i + 1}. ${tool.name} - ${tool.description}`);
            });
          }
          break;
        case 3:
          console.log('✅ Get log files test passed');
          break;
        case 4:
          console.log('✅ Server status test passed');
          break;
        case 5:
          console.log('✅ Tail log test passed');
          break;
        case 6:
          console.log('✅ Search logs test passed');
          break;
      }
    }
  }

  // Test sequence
  const tests = [
    {
      name: 'Initialize',
      message: {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      }
    },
    {
      name: 'List Tools',
      message: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }
    },
    {
      name: 'Get Log Files',
      message: {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'get_log_files',
          arguments: {}
        }
      }
    },
    {
      name: 'Get Server Status',
      message: {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_server_status',
          arguments: {}
        }
      }
    },
    {
      name: 'Tail Log',
      message: {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'tail_log',
          arguments: { filename: 'combined.log', lines: 3 }
        }
      }
    },
    {
      name: 'Search Logs',
      message: {
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'search_logs',
          arguments: { query: 'test', lines: 5 }
        }
      }
    }
  ];

  // Run tests with delays
  tests.forEach((test, index) => {
    setTimeout(() => {
      console.log(`${index + 1}️⃣  Testing ${test.name}...`);
      server.stdin.write(JSON.stringify(test.message) + '\n');
    }, (index + 1) * 200);
  });

  // Final summary
  setTimeout(() => {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Tests passed: ${testsPassed}/${totalTests}`);
    
    if (testsPassed === totalTests) {
      console.log('🎉 All tests passed! MCP server is working correctly.');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Check the output above.');
      process.exit(1);
    }
    
    server.kill();
  }, 2000);
}

testMCPServer();
