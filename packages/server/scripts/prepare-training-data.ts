/**
 * Prepare memory data for Librarian AI fine-tuning
 * Converts raw memories to Mistral/Llama instruction format
 *
 * Usage:
 * npx tsx prepare-training-data.ts --input memories.jsonl --output formatted.jsonl
 */

import * as fs from 'fs';
import { createReadStream, createWriteStream } from 'fs';
import * as readline from 'readline';

interface Memory {
  content: string;
  context?: string;
  importance?: 'low' | 'medium' | 'high';
  timestamp?: number;
  tags?: string[];
}

interface TrainingExample {
  instruction: string;
  input: string;
  output: string;
}

// Parse command line arguments
function getArgument(key: string, defaultValue = ''): string {
  const index = process.argv.indexOf(`--${key}`);
  if (index === -1) return defaultValue;
  return String(process.argv[index + 1] ?? defaultValue);
}

const inputFile: string = getArgument('input', 'memories-demo.jsonl');
const outputFile: string = getArgument('output', 'mistral-formatted.jsonl');
const trainTestSplit: number = parseFloat(getArgument('split-ratio', '0.9'));
const modelType: string = getArgument('model', 'mistral');

console.log(`📊 Preparing training data for ${modelType}`);
console.log(`📖 Input: ${inputFile}`);
console.log(`💾 Output: ${outputFile}`);
console.log(`📈 Train/Test Split: ${(trainTestSplit * 100).toFixed(0)}%`);

// Generate training examples from memories
function generateTrainingExamples(memory: Memory): TrainingExample[] {
  const examples: TrainingExample[] = [];

  // Example 1: Summarization
  examples.push({
    instruction: 'Summarize the following memory concisely.',
    input: memory.content,
    output: `This memory discusses: ${memory.content.substring(0, 100)}... (Context: ${memory.context || 'General'})`,
  });

  // Example 2: Context classification
  examples.push({
    instruction: 'Classify the context of the following memory.',
    input: memory.content,
    output: memory.context || 'General',
  });

  // Example 3: Importance assessment
  examples.push({
    instruction: 'Rate the importance of this memory on a scale of low, medium, or high.',
    input: memory.content,
    output: memory.importance || 'medium',
  });

  // Example 4: Tag extraction
  examples.push({
    instruction: 'Extract relevant keywords from this memory.',
    input: memory.content,
    output: (memory.tags || []).join(', ') || 'memory, information, context',
  });

  // Example 5: Related memory generation (for recall improvement)
  examples.push({
    instruction: 'Generate a search query that would help retrieve this memory.',
    input: memory.content,
    output: extractKeyPhrases(memory.content),
  });

  return examples;
}

// Extract key phrases for search queries
function extractKeyPhrases(content: string): string {
  // Simple key phrase extraction (in production, use NLP)
  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4 && !isCommonWord(w));

  return words.slice(0, 5).join(', ');
}

// Common words to filter out
function isCommonWord(word: string): boolean {
  const common = [
    'the',
    'that',
    'this',
    'with',
    'from',
    'have',
    'been',
    'were',
    'they',
    'their',
  ];
  return common.includes(word);
}

// Format for different model types
function formatForModel(example: TrainingExample, model: string): string {
  if (model === 'mistral') {
    // Mistral instruction format
    return JSON.stringify({
      text: `[INST] ${example.instruction}\n${example.input} [/INST] ${example.output}`,
    });
  } else if (model === 'llama') {
    // LLaMA instruction format
    return JSON.stringify({
      instruction: example.instruction,
      input: example.input,
      output: example.output,
    });
  } else {
    // Generic format
    return JSON.stringify(example);
  }
}

async function processMemories() {
  const fileStream = createReadStream(inputFile);
  const writeStream = createWriteStream(outputFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let exampleCount = 0;
  const trainExamples: string[] = [];
  const testExamples: string[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const memory: Memory = JSON.parse(line);
      const examples = generateTrainingExamples(memory);

      exampleCount += examples.length;

      // Split into train/test
      examples.forEach((example) => {
        const formatted = formatForModel(example, modelType);
        if (Math.random() < trainTestSplit) {
          trainExamples.push(formatted);
        } else {
          testExamples.push(formatted);
        }
      });

      lineCount++;
    } catch (e) {
      console.warn(`⚠️  Skipped invalid JSON on line ${lineCount + 1}`);
    }
  }

  // Write all examples
  const allExamples = [...trainExamples, ...testExamples];
  allExamples.forEach((example) => {
    writeStream.write(example + '\n');
  });

  writeStream.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log(`\n✅ Training data prepared:`);
      console.log(`   📝 Input memories: ${lineCount}`);
      console.log(`   🔄 Training examples: ${exampleCount}`);
      console.log(`   🏋️  Training set: ${trainExamples.length}`);
      console.log(`   🧪 Test set: ${testExamples.length}`);
      console.log(`   📂 Output file: ${outputFile}`);
      console.log(`\n📊 File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
      resolve();
    });

    writeStream.on('error', reject);
  });
}

// Main execution
processMemories().catch((err) => {
  console.error('❌ Error processing memories:', err);
  process.exit(1);
});
