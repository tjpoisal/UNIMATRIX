// k6 Load Test Script
// Run: k6 run scripts/k6-loadtest.js --vus 100 --duration 5m

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const durationMemoryUpload = new Trend('duration_memory_upload');
const durationMemoryRecall = new Trend('duration_memory_recall');
const durationMCPCall = new Trend('duration_mcp_call');
const successfulRecalls = new Counter('successful_recalls');
const encryptionErrors = new Counter('encryption_errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Warm up
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '2m', target: 100 },   // Stay at peak
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    errors: ['rate<0.1'],                   // Error rate < 10%
    'duration_memory_upload': ['p(95)<500'],  // p95 < 500ms
    'duration_memory_recall': ['p(95)<300'],  // p95 < 300ms
    'duration_mcp_call': ['p(95)<400'],       // p95 < 400ms
  },
};

const BASE_URL = 'https://unimatrix-staging.fly.dev';
const TEST_TOKEN = __ENV.TEST_TOKEN || 'dev-staging-token-123';

// Generate random encrypted memory for testing
function generateEncryptedMemory() {
  return {
    ciphertext: 'u2FsdGVkX1' + Math.random().toString(36).substring(7),
    nonce: 'nonce' + Math.random().toString(36).substring(7),
    timestamp: Date.now(),
    context: ['Development', 'Learning', 'Research'][Math.floor(Math.random() * 3)],
    importance: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
  };
}

// Generate random search query
function generateQuery() {
  const queries = [
    'python recursion',
    'react hooks',
    'api design',
    'database schema',
    'encryption',
    'performance optimization',
    'testing strategies',
    'memory management',
  ];
  return queries[Math.floor(Math.random() * queries.length)];
}

export default function () {
  // Scenario 1: Memory Upload
  group('Memory Upload Test', () => {
    const payload = JSON.stringify(generateEncryptedMemory());
    const startTime = Date.now();

    const res = http.post(`${BASE_URL}/api/memories/create`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const duration = Date.now() - startTime;
    durationMemoryUpload.add(duration);

    check(res, {
      'upload status is 200': (r) => r.status === 200,
      'upload response contains memoryId': (r) => r.body.includes('memoryId'),
      'upload completes in <500ms': (r) => duration < 500,
    }) || errorRate.add(1);

    sleep(1);
  });

  // Scenario 2: Memory Recall (Search)
  group('Memory Recall Test', () => {
    const query = generateQuery();
    const startTime = Date.now();

    const res = http.get(`${BASE_URL}/api/memories/recall?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    });

    const duration = Date.now() - startTime;
    durationMemoryRecall.add(duration);

    check(res, {
      'recall status is 200': (r) => r.status === 200,
      'recall returns memories': (r) => r.body.includes('memories'),
      'recall completes in <300ms': (r) => duration < 300,
    }) || errorRate.add(1);

    if (res.status === 200) {
      successfulRecalls.add(1);
    }

    sleep(1);
  });

  // Scenario 3: MCP Protocol Call
  group('MCP Protocol Test', () => {
    const mcpPayload = JSON.stringify({
      action: 'recall',
      query: generateQuery(),
    });

    const startTime = Date.now();

    const res = http.post(`${BASE_URL}/api/mcp`, mcpPayload, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const duration = Date.now() - startTime;
    durationMCPCall.add(duration);

    check(res, {
      'MCP status is 200': (r) => r.status === 200,
      'MCP response valid': (r) => r.body.includes('result') || r.body.includes('error'),
      'MCP completes in <400ms': (r) => duration < 400,
    }) || errorRate.add(1);

    sleep(1);
  });

  // Scenario 4: Encryption/Decryption
  group('Encryption Test', () => {
    const encryptPayload = JSON.stringify({
      content: 'Test memory for encryption: ' + Math.random().toString(36).substring(7),
      password: 'test-encryption-password-123',
    });

    const res = http.post(`${BASE_URL}/api/encrypt`, encryptPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    check(res, {
      'encryption returns 200': (r) => r.status === 200,
      'encryption result has ciphertext': (r) => r.body.includes('ciphertext'),
      'encryption result has nonce': (r) => r.body.includes('nonce'),
    }) || encryptionErrors.add(1);

    sleep(1);
  });

  // Scenario 5: Dashboard Load (multiple assets)
  group('Dashboard Load Test', () => {
    const res = http.get(`${BASE_URL}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    });

    check(res, {
      'dashboard loads': (r) => r.status === 200,
      'dashboard contains expected content': (r) => r.body.includes('memory') || r.body.includes('dashboard'),
    }) || errorRate.add(1);

    sleep(1);
  });
}
