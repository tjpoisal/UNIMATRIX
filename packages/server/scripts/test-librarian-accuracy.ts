/**
 * Test Librarian AI recall accuracy
 * Measures relevance of memory recalls against ground truth
 *
 * Usage:
 * npx tsx test-librarian-accuracy.ts --memories memories.jsonl --model ./models/librarian-v1
 */

import * as fs from 'fs';
import * as readline from 'readline';

interface Memory {
  content: string;
  context?: string;
  importance?: 'low' | 'medium' | 'high';
}

interface TestResult {
  query: string;
  expectedContext: string;
  recalledMemories: RecalledMemory[];
  accuracy: number;
  timeMs: number;
  passed: boolean;
}

interface RecalledMemory {
  id: number;
  relevance: number;
  context?: string;
}

// Parse command line arguments
function getArgument(key: string, defaultValue?: string): string | undefined {
  const index = process.argv.indexOf(`--${key}`);
  if (index === -1) return defaultValue;
  return process.argv[index + 1];
}

const memoriesFile = getArgument('memories', 'packages/server/memories-demo.jsonl');
const outputFile = getArgument('output', 'test-results/accuracy-report.json');
const modelPath = getArgument('model', './models/librarian-v1');

console.log(`🧪 Testing Librarian AI Accuracy`);
console.log(`📖 Memories: ${memoriesFile}`);
console.log(`🤖 Model: ${modelPath}`);

async function loadMemories(): Promise<Memory[]> {
  const memories: Memory[] = [];
  const fileStream = fs.createReadStream(memoriesFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      memories.push(JSON.parse(line));
    } catch (e) {
      // Skip invalid lines
    }
  }

  return memories;
}

// Simulate recall ranking (in production, this would call the actual model)
function simulateRecall(query: string, memories: Memory[]): RecalledMemory[] {
  const queryWords = query.toLowerCase().split(/\s+/);

  // Score each memory based on word overlap (BM25-ish)
  const scored = memories.map((memory, idx) => {
    const contentLower = memory.content.toLowerCase();
    const matchCount = queryWords.filter((word) => contentLower.includes(word)).length;
    const relevance = Math.min(1.0, matchCount / queryWords.length);

    return {
      id: idx,
      relevance: parseFloat(relevance.toFixed(2)),
      context: memory.context,
    };
  });

  // Sort by relevance (descending)
  return scored.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

// Generate test queries from memories
function generateQueries(memories: Memory[]): Array<{ query: string; expectedContext: string }> {
  const queries: Array<{ query: string; expectedContext: string }> = [];

  memories.forEach((memory) => {
    // Extract first few words as query
    const words = memory.content.split(/\s+/).slice(0, 3).join(' ');
    queries.push({
      query: words,
      expectedContext: memory.context || 'General',
    });
  });

  return queries;
}

// Calculate relevance score for test
function calculateRelevance(
  recalled: RecalledMemory[],
  expectedContext: string,
  memories: Memory[]
): number {
  if (recalled.length === 0) return 0;

  // Check how many recalled memories match expected context
  const matches = recalled.filter((r) => memories[r.id]?.context === expectedContext).length;

  return parseFloat((matches / recalled.length).toFixed(2));
}

async function runAccuracyTest() {
  console.log(`\n⏳ Loading memories...`);
  const memories = await loadMemories();
  console.log(`✅ Loaded ${memories.length} memories`);

  console.log(`\n⏳ Generating test queries...`);
  const queries = generateQueries(memories);
  console.log(`✅ Generated ${queries.length} test queries`);

  console.log(`\n🧪 Running accuracy tests...\n`);

  const results: TestResult[] = [];
  let totalAccuracy = 0;
  let passCount = 0;

  queries.forEach((q, idx) => {
    const startTime = Date.now();
    const recalled = simulateRecall(q.query, memories);
    const timeMs = Date.now() - startTime;

    const accuracy = calculateRelevance(recalled, q.expectedContext, memories);
    const passed = accuracy >= 0.6; // 60% relevance threshold

    if (passed) passCount++;
    totalAccuracy += accuracy;

    results.push({
      query: q.query,
      expectedContext: q.expectedContext,
      recalledMemories: recalled,
      accuracy,
      timeMs,
      passed,
    });

    if ((idx + 1) % 5 === 0) {
      process.stdout.write(`.`);
    }
  });

  console.log(`\n\n📊 Test Results:`);
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed: ${passCount} (${((passCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`   Average Accuracy: ${((totalAccuracy / results.length) * 100).toFixed(1)}%`);

  // Calculate metrics
  const latencies = results.map((r) => r.timeMs);
  const p50 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  console.log(`\n⚡ Performance Metrics:`);
  console.log(`   p50 Latency: ${p50}ms`);
  console.log(`   p95 Latency: ${p95}ms`);
  console.log(`   p99 Latency: ${p99}ms`);

  // Breakdown by context
  const contextStats: Record<string, { count: number; passed: number; avgAccuracy: number }> = {};

  results.forEach((r) => {
    if (!contextStats[r.expectedContext]) {
      contextStats[r.expectedContext] = { count: 0, passed: 0, avgAccuracy: 0 };
    }
    contextStats[r.expectedContext].count++;
    if (r.passed) contextStats[r.expectedContext].passed++;
    contextStats[r.expectedContext].avgAccuracy += r.accuracy;
  });

  console.log(`\n📋 Breakdown by Context:`);
  Object.entries(contextStats).forEach(([context, stats]) => {
    const pct = ((stats.avgAccuracy / stats.count) * 100).toFixed(1);
    console.log(`   ${context}: ${stats.passed}/${stats.count} passed (${pct}% avg accuracy)`);
  });

  // Write full report
  const report = {
    timestamp: new Date().toISOString(),
    model: modelPath,
    memoriesCount: memories.length,
    testsCount: results.length,
    passRate: passCount / results.length,
    averageAccuracy: totalAccuracy / results.length,
    latency: { p50, p95, p99 },
    contextStats,
    detailedResults: results,
  };

  // Create output directory if needed
  const outputDir = outputFile.substring(0, outputFile.lastIndexOf('/'));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to: ${outputFile}`);
}

// Main execution
runAccuracyTest().catch((err) => {
  console.error('❌ Error running accuracy test:', err);
  process.exit(1);
});
