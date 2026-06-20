/**
 * UNIMATRIX_CLAUDE_INTEGRATION
 *
 * This module wraps Claude API calls to automatically:
 * 1. Query Unimatrix palaces before each interaction
 * 2. Inject palace context into system prompt
 * 3. Parse Claude response for palace writes
 * 4. Record entire interaction to conversation history
 *
 * Usage:
 *   const response = await claudeWithUnimatrix({
 *     userId: 'user-123',
 *     conversationId: 'conv-456',
 *     userMessage: 'What are the current weather alerts?',
 *     palaceIds: ['palace-resilience-weather', 'palace-agent-memory']
 *   });
 */

import Anthropic from '@anthropic-ai/sdk';

interface UnimatrixConfig {
  apiKey: string;  // AppSync API Key
  graphqlEndpoint: string;  // AppSync endpoint
  region: string;
}

interface ClaudeUnimatrixInput {
  userId: string;
  conversationId: string;
  userMessage: string;
  palaceIds?: string[];  // If not provided, auto-discover from userId
  model?: string;
}

interface PalaceData {
  palaceId: string;
  wing: string;
  room: string;
  hall: string;
  content: string;
  createdBy: string;
}

interface PalaceWrite {
  palaceId: string;
  wing: string;
  room: string;
  hall: string;
  content: string;
  drawerType: 'finding' | 'reasoning' | 'decision' | 'context';
}

// ============================================
// Initialize clients
// ============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const config: UnimatrixConfig = {
  apiKey: process.env.APPSYNC_API_KEY || '',
  graphqlEndpoint: process.env.APPSYNC_ENDPOINT || '',
  region: 'us-east-1',
};

// ============================================
// 1. QUERY PALACES FOR CONTEXT
// ============================================

async function queryPalacesForContext(
  userId: string,
  palaceIds?: string[]
): Promise<Map<string, PalaceData[]>> {
  /**
   * Fetch palace data from Unimatrix.
   * Returns a map of {palaceId → array of relevant drawers}
   */

  const palaceDataMap = new Map<string, PalaceData[]>();

  try {
    // If palaceIds not provided, discover all user palaces
    const targetPalaces = palaceIds || (await discoverUserPalaces(userId));

    for (const palaceId of targetPalaces) {
      // Query AppSync for palace structure
      const query = `
        query GetPalace($id: ID!) {
          getPalace(id: $id) {
            id
            name
            structure {
              wings {
                name
                rooms {
                  name
                  halls {
                    name
                    drawers {
                      id
                      type
                      content
                      createdBy
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(config.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
        },
        body: JSON.stringify({
          query,
          variables: { id: palaceId },
        }),
      });

      const data = (await response.json()) as any;
      const palace = data.data?.getPalace;

      if (!palace) continue;

      // Flatten palace structure into array of drawers
      const drawers: PalaceData[] = [];
      palace.structure.wings.forEach((wing: any) => {
        wing.rooms.forEach((room: any) => {
          room.halls.forEach((hall: any) => {
            hall.drawers.forEach((drawer: any) => {
              drawers.push({
                palaceId,
                wing: wing.name,
                room: room.name,
                hall: hall.name,
                content: drawer.content,
                createdBy: drawer.createdBy,
              });
            });
          });
        });
      });

      palaceDataMap.set(palaceId, drawers);
    }
  } catch (err) {
    console.error('Error querying palaces:', err);
  }

  return palaceDataMap;
}

async function discoverUserPalaces(userId: string): Promise<string[]> {
  /**
   * Discover all palaces accessible to a user.
   */

  const query = `
    query GetUserPalaces($userId: String!) {
      getUserPalaces(userId: $userId) {
        id
        name
      }
    }
  `;

  const response = await fetch(config.graphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify({
      query,
      variables: { userId },
    }),
  });

  const data = (await response.json()) as any;
  return data.data?.getUserPalaces?.map((p: any) => p.id) || [];
}

// ============================================
// 2. BUILD SYSTEM PROMPT WITH PALACE CONTEXT
// ============================================

function buildUnimatrixSystemPrompt(palaceDataMap: Map<string, PalaceData[]>): string {
  /**
   * Create a system prompt that includes palace context.
   * This tells Claude what information it has access to and how to use it.
   */

  let prompt = `# UNIMATRIX - Your Persistent Memory System

You have access to Unimatrix, a shared memory layer that persists across conversations.
Unimatrix stores important context, decisions, and findings that should inform your responses.

## How to Use Unimatrix

**When responding:**
1. Consider relevant palace data (see below) for context
2. Make decisions that are consistent with documented findings
3. If you uncover something important, declare a PALACE_WRITE

**How to write to a palace:**
Include this in your response:

\`\`\`
[PALACE_WRITE]
Palace: palace-id
Wing: wing-name
Room: room-name
Hall: hall-name
Type: finding|reasoning|decision|context
Content: {your finding}
\`\`\`

Palace writes are persisted and available to other agents.

## Available Palaces & Recent Data

`;

  // Add palace data to prompt
  let hasData = false;
  palaceDataMap.forEach((drawers, palaceId) => {
    if (drawers.length === 0) return;

    hasData = true;
    prompt += `\n### Palace: ${palaceId}\n\n`;

    // Group drawers by wing
    const byWing = new Map<string, PalaceData[]>();
    drawers.forEach((d) => {
      const key = d.wing;
      if (!byWing.has(key)) byWing.set(key, []);
      byWing.get(key)!.push(d);
    });

    byWing.forEach((wingDrawers, wingName) => {
      prompt += `**${wingName}:**\n`;

      // Show last 3 drawers per wing (most recent)
      wingDrawers.slice(-3).forEach((d) => {
        prompt += `- [${d.room}/${d.hall}] ${d.content.substring(0, 100)}...\n`;
        prompt += `  (Added by: ${d.createdBy})\n`;
      });

      prompt += '\n';
    });
  });

  if (!hasData) {
    prompt += '\nNo palace data available yet. Your responses will help populate the palaces.\n';
  }

  prompt += `
## Important

- **Palace writes are not instant.** They're queued for async processing.
- **Don't overwrite existing drawers.** Add new findings alongside existing data.
- **Be explicit about uncertainty.** Label speculative thinking as such.
- **Reference palace data** when making decisions based on it.

Start your response naturally. If you have a palace write, include it at the end.
`;

  return prompt;
}

// ============================================
// 3. CALL CLAUDE WITH PALACE CONTEXT
// ============================================

async function callClaudeWithContext(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  /**
   * Call Claude API with injected palace context.
   */

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// ============================================
// 4. PARSE CLAUDE RESPONSE FOR PALACE WRITES
// ============================================

function parsePalaceWrites(response: string): PalaceWrite[] {
  /**
   * Extract [PALACE_WRITE] blocks from Claude response.
   *
   * Format:
   * [PALACE_WRITE]
   * Palace: palace-id
   * Wing: wing-name
   * Room: room-name
   * Hall: hall-name
   * Type: finding|reasoning|decision|context
   * Content: {text}
   * [/PALACE_WRITE]
   */

  const writes: PalaceWrite[] = [];
  const regex = /\[PALACE_WRITE\](.*?)\[\/PALACE_WRITE\]/gs;

  let match;
  while ((match = regex.exec(response))) {
    const block = match[1];

    const palaceMatch = block.match(/Palace:\s*(.+?)(\n|$)/);
    const wingMatch = block.match(/Wing:\s*(.+?)(\n|$)/);
    const roomMatch = block.match(/Room:\s*(.+?)(\n|$)/);
    const hallMatch = block.match(/Hall:\s*(.+?)(\n|$)/);
    const contentMatch = block.match(/Content:\s*([\s\S]+?)(\n\[|$)/);

    if (palaceMatch && wingMatch && roomMatch && hallMatch && contentMatch) {
      writes.push({
        palaceId: palaceMatch[1].trim(),
        wing: wingMatch[1].trim(),
        room: roomMatch[1].trim(),
        hall: hallMatch[1].trim(),
        content: contentMatch[1].trim(),
        drawerType: 'finding',  // Default; can be overridden
      });
    }
  }

  return writes;
}

// ============================================
// 5. WRITE TO PALACES
// ============================================

async function writeToPalaces(writes: PalaceWrite[]): Promise<void> {
  /**
   * Send palace writes to Unimatrix via AppSync.
   */

  for (const write of writes) {
    try {
      const mutation = `
        mutation WriteToPalace(
          $palaceId: String!
          $wing: String!
          $room: String!
          $hall: String!
          $drawer: DrawerInput!
        ) {
          writeToPalace(
            palaceId: $palaceId
            wing: $wing
            room: $room
            hall: $hall
            drawer: $drawer
          ) {
            id
            createdAt
          }
        }
      `;

      await fetch(config.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            palaceId: write.palaceId,
            wing: write.wing,
            room: write.room,
            hall: write.hall,
            drawer: {
              type: write.drawerType,
              content: write.content,
              metadata: {
                source: 'claude-interaction',
                timestamp: new Date().toISOString(),
              },
            },
          },
        }),
      });

      console.log(
        `✓ Wrote to ${write.palaceId}/${write.wing}/${write.room}/${write.hall}`
      );
    } catch (err) {
      console.error('Error writing to palace:', err);
    }
  }
}

// ============================================
// 6. RECORD INTERACTION TO CONVERSATION HISTORY
// ============================================

async function recordConversationMessage(
  conversationId: string,
  userId: string,
  userMessage: string,
  assistantResponse: string,
  palaceReads: string[],
  palaceWrites: PalaceWrite[]
): Promise<void> {
  /**
   * Log the entire interaction to conversation history.
   * This creates an audit trail and improves future context.
   */

  try {
    const mutation = `
      mutation RecordMessage(
        $conversationId: String!
        $userId: String!
        $message: MessageInput!
        $palaceReads: [String!]
        $palaceWrites: [PalaceWriteInput!]
      ) {
        recordMessage(
          conversationId: $conversationId
          userId: $userId
          message: $message
          palaceReads: $palaceReads
          palaceWrites: $palaceWrites
        ) {
          id
          timestamp
        }
      }
    `;

    await fetch(config.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          conversationId,
          userId,
          message: {
            role: 'assistant',
            content: assistantResponse,
          },
          palaceReads,
          palaceWrites: palaceWrites.map((w) => ({
            palaceId: w.palaceId,
            wing: w.wing,
            room: w.room,
            hall: w.hall,
            drawer: {
              type: w.drawerType,
              content: w.content,
            },
          })),
        },
      }),
    });

    console.log(`✓ Recorded conversation message`);
  } catch (err) {
    console.error('Error recording conversation:', err);
  }
}

// ============================================
// 7. MAIN ENTRY POINT
// ============================================

export async function claudeWithUnimatrix(
  input: ClaudeUnimatrixInput
): Promise<string> {
  console.log(`\n🧠 Unimatrix interaction starting...`);
  console.log(`   User: ${input.userId}`);
  console.log(`   Conversation: ${input.conversationId}`);
  console.log(`   Message: "${input.userMessage.substring(0, 50)}..."`);

  // 1. Query palaces for context
  console.log('\n📖 Querying palaces for context...');
  const palaceDataMap = await queryPalacesForContext(input.userId, input.palaceIds);
  const palaceIds = Array.from(palaceDataMap.keys());
  console.log(`   Found ${palaceIds.length} palaces`);

  // 2. Build system prompt with palace context
  const systemPrompt = buildUnimatrixSystemPrompt(palaceDataMap);

  // 3. Call Claude
  console.log('\n🤖 Calling Claude with palace context...');
  const claudeResponse = await callClaudeWithContext(input.userMessage, systemPrompt);

  // 4. Parse palace writes
  const palaceWrites = parsePalaceWrites(claudeResponse);
  console.log(`\n📝 Parsed ${palaceWrites.length} palace writes`);

  // 5. Write to palaces
  if (palaceWrites.length > 0) {
    console.log('\n💾 Writing to palaces...');
    await writeToPalaces(palaceWrites);
  }

  // 6. Record to conversation history
  console.log('\n📋 Recording to conversation history...');
  await recordConversationMessage(
    input.conversationId,
    input.userId,
    input.userMessage,
    claudeResponse,
    palaceIds,
    palaceWrites
  );

  console.log('\n✨ Unimatrix interaction complete\n');

  // Remove palace writes from response before returning to user
  return claudeResponse
    .replace(/\[PALACE_WRITE\].*?\[\/PALACE_WRITE\]/gs, '')
    .trim();
}

// ============================================
// Export for external use
// ============================================

export { UnimatrixConfig, ClaudeUnimatrixInput, PalaceData, PalaceWrite };
