/**
 * scripts/export-memories-for-finetuning.ts
 *
 * Export your personal memories from Neon for fine-tuning the Librarian model.
 *
 * Run: npx tsx scripts/export-memories-for-finetuning.ts > memories.jsonl
 *
 * Output: JSONL file where each line is a training example for the Librarian:
 * ```
 * {"content": "...", "context": "...", "tags": [...], "importance": "high"}
 * ```
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface MemoryTrainingExample {
  content: string;
  context?: string;
  tags: string[];
  importance: 'low' | 'medium' | 'high';
  timestamp: string;
}

async function exportMemories() {
  try {
    // Get all your memories (assuming you're the first user, or adjust userId as needed)
    const memories = await prisma.memory.findMany({
      include: {
        location: {
          include: {
            palace: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.error(
      `Found ${memories.length} memories. Formatting for training...`,
    );

    const trainingExamples: MemoryTrainingExample[] = memories.map((mem) => ({
      content: mem.content,
      context: mem.location?.name || mem.location?.palace?.name || undefined,
      tags: mem.tags || [],
      importance:
        mem.embedding && (mem.embedding as any).importance === 'high'
          ? 'high'
          : 'medium',
      timestamp: mem.createdAt.toISOString(),
    }));

    // Output as JSONL (one JSON object per line)
    for (const example of trainingExamples) {
      console.log(JSON.stringify(example));
    }

    console.error(`Exported ${trainingExamples.length} training examples.`);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportMemories();
