/**
 * Custom Next.js + WebSocket server for Unimatrix on Render (and other PaaS).
 *
 * Why this exists:
 * - Long-lived WebSocket connections for the multi-LLM Collab Room on Render / self-hosted
 * - Alternative managed path: Ably (see apps/web/lib/realtime/ably.ts + lib/collab/)
 * - Same HTTP server handles both Next.js pages/API routes + raw WS upgrades
 *
 * Usage:
 *   pnpm --filter web build
 *   pnpm --filter web start:prod
 *
 * Environment:
 *   PORT is provided automatically by Render / Railway / Fly.io etc.
 */

import { createServer } from 'http';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { publishToRoom, subscribeToRoom, notifyLocalSubscribers } from './lib/realtime/redis-pubsub';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Bind to all interfaces (required on Render)
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname });
const handle = app.getRequestHandler();

// In-memory room registry (MVP). Replace with Redis adapter when scaling horizontally.
const rooms = new Map<string, Set<WebSocket>>();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // ──────────────────────────────────────────────────────────────
  // WebSocket Server — Collab Room
  // Mount at: ws(s)://<host>/ws/collab?roomId=palace-123
  // ──────────────────────────────────────────────────────────────
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname, query } = parse(request.url!, true);

    if (pathname === '/ws/collab' || pathname?.startsWith('/ws/collab')) {
      const roomId = (query.roomId as string) || 'global';

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, roomId);
      });
    } else {
      // Reject unknown upgrade paths
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, _request: any, roomId: string) => {
    console.log(`[WS] Client connected → room: ${roomId}`);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    const room = rooms.get(roomId)!;
    room.add(ws);

    // Subscribe this instance to cross-instance messages for the room
    const unsubscribe = subscribeToRoom(roomId, (_channel, message) => {
      // Deliver to local clients (except if we want to filter sender)
      room.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    });

    // Welcome message
    ws.send(
      JSON.stringify({
        type: 'connected',
        roomId,
        timestamp: new Date().toISOString(),
      })
    );

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const outgoing = {
          ...message,
          roomId,
          timestamp: new Date().toISOString(),
        };

        // 1. Publish to Redis so other instances can deliver
        publishToRoom(roomId, outgoing).catch(() => {});

        // 2. Deliver locally immediately (low latency for same instance)
        room.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(outgoing));
          }
        });

        // Also notify any local subscribers from redis-pubsub (for consistency)
        notifyLocalSubscribers(roomId, outgoing);
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });

    ws.on('close', () => {
      unsubscribe();
      room.delete(ws);
      if (room.size === 0) {
        rooms.delete(roomId);
      }
      console.log(`[WS] Client disconnected from room: ${roomId}`);
    });

    ws.on('error', (error) => {
      console.error('[WS] Connection error:', error);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Start listening
  // ──────────────────────────────────────────────────────────────
  server.listen(port, hostname, () => {
    console.log(`> Unimatrix Web ready on http://${hostname}:${port}`);
    console.log(`> WebSocket Collab endpoint → ws://${hostname}:${port}/ws/collab?roomId=<id>`);
  });

  // Graceful shutdown (Render sends SIGTERM)
  const shutdown = (signal: string) => {
    console.log(`\n[shutdown] ${signal} received — closing server...`);

    wss.close(() => {
      server.close(() => {
        console.log('[shutdown] HTTP + WS server closed cleanly');
        process.exit(0);
      });
    });

    // Force exit after 10s if something is stuck
    setTimeout(() => {
      console.error('[shutdown] Forcing exit after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});
