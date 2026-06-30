#!/usr/bin/env npx tsx

/**
 * MCP Integration Test Script
 * 
 * Tests the Unimatrix MCP server endpoints to verify:
 * - Health check
 * - MCP tool availability
 * - Authentication
 * - Basic tool functionality
 * 
 * Usage:
 *   MCP_TOKEN=your_token MCP_URL=https://unimatrix-mcp.fly.dev/mcp npx tsx scripts/test-mcp-integration.ts
 */

const MCP_URL = process.env.MCP_URL || 'https://unimatrix-mcp.fly.dev/mcp';
const MCP_TOKEN = process.env.MCP_TOKEN || '';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration });
    console.log(`✅ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, duration, error: errorMessage });
    console.log(`❌ ${name} (${duration}ms) - ${errorMessage}`);
  }
}

async function healthCheck(): Promise<void> {
  const response = await fetch(MCP_URL.replace('/mcp', '/health'));
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'ok') {
    throw new Error('Health check returned non-ok status');
  }
}

async function testMCPConnect(): Promise<void> {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MCP_TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP connect failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`MCP error: ${data.error.message}`);
  }

  const tools = data.result?.tools || [];
  const expectedTools = [
    'remember',
    'recall',
    'get_recent',
    'continue_from',
    'list_contexts',
  ];

  for (const tool of expectedTools) {
    if (!tools.some((t: any) => t.name === tool)) {
      throw new Error(`Missing expected tool: ${tool}`);
    }
  }
}

async function testRememberTool(): Promise<void> {
  const testContent = `Test memory from integration test at ${new Date().toISOString()}`;
  
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MCP_TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'remember',
        arguments: {
          content: testContent,
          context: 'Integration test',
          tags: ['test', 'integration'],
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Remember tool failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Remember tool error: ${data.error.message}`);
  }
}

async function testListContexts(): Promise<void> {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MCP_TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_contexts',
        arguments: {},
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`List contexts failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`List contexts error: ${data.error.message}`);
  }
}

async function testGetRecent(): Promise<void> {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MCP_TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_recent',
        arguments: {
          limit: 5,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Get recent failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Get recent error: ${data.error.message}`);
  }
}

async function testRecallTool(): Promise<void> {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MCP_TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'recall',
        arguments: {
          query: 'integration test',
          limit: 3,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Recall tool failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Recall tool error: ${data.error.message}`);
  }
}

async function main(): Promise<void> {
  console.log('🧪 Unimatrix MCP Integration Tests');
  console.log(`📍 MCP URL: ${MCP_URL}`);
  console.log(`🔑 Token: ${MCP_TOKEN ? '***' + MCP_TOKEN.slice(-4) : 'NOT SET'}`);
  console.log('');

  if (!MCP_TOKEN) {
    console.error('❌ MCP_TOKEN environment variable is required');
    console.log('Usage: MCP_TOKEN=your_token npx tsx scripts/test-mcp-integration.ts');
    process.exit(1);
  }

  // Run tests
  await test('Health Check', healthCheck);
  await test('MCP Connect & Tool List', testMCPConnect);
  await test('Remember Tool', testRememberTool);
  await test('List Contexts', testListContexts);
  await test('Get Recent', testGetRecent);
  await test('Recall Tool', testRecallTool);

  // Summary
  console.log('');
  console.log('📊 Test Summary');
  console.log('─'.repeat(50));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Duration: ${totalDuration}ms`);

  if (failed > 0) {
    console.log('');
    console.log('❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('');
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
