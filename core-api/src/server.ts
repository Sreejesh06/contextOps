import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { WebSocketServer } from 'ws';
import http from 'http';

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize BullMQ Queue connected to local Redis
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

const incidentQueue = new Queue('incident-investigation-queue', {
  connection: redisOptions,
});

// PagerDuty Webhook Endpoint
app.post('/api/webhooks/pagerduty', async (req, res) => {
  const payload = req.body;
  
  try {
    // Return 200 OK immediately as requested
    res.status(200).send({ message: 'Webhook received' });
    
    // Create new incident in database
    const incident = await prisma.incident.create({
      data: {
        status: 'INVESTIGATING',
        trigger_data: payload,
      },
    });
    
    // Simple configuration dictionary mapping services to GitHub repos
    const serviceMap: Record<string, string> = {
      "payment-gateway": "sreejesh06/orythm"
    };

    const service = payload.service || '';
    const githubRepo = serviceMap[service] || "sreejesh06/orythm"; // fallback

    // Push a job to BullMQ
    await incidentQueue.add('process-incident', {
      incidentId: incident.id,
      payload: payload,
      github_repo: githubRepo,
    });
    
    console.log(`Incident ${incident.id} created and queued for investigation.`);
  } catch (error) {
    console.error('Error processing PagerDuty webhook:', error);
  }
});

// Create HTTP server
const server = http.createServer(app);

import Redis from 'ioredis';

// Initialize WebSocket server on the same HTTP server, but user said "on port 8080"
// I will bind it to the same server that will listen on 8080
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });
});

// Setup Redis subscriber to broadcast updates to WebSockets
const redisSubscriber = new Redis({
  host: redisOptions.host,
  port: redisOptions.port
});

redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error', err));

async function setupRedisSubscriber() {
  console.log('Connected to Redis Pub/Sub');
  
  await redisSubscriber.subscribe('incident_updates');
  redisSubscriber.on('message', (channel, message) => {
    if (channel === 'incident_updates') {
      console.log(`[Redis] Received: ${message}`);
      // Broadcast to all connected WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
        }
      });
    }
  });
}
setupRedisSubscriber();

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, async () => {
  console.log(`Core API running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  
  try {
    await prisma.$connect();
    console.log('Connected to Prisma Database');
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await incidentQueue.close();
  process.exit(0);
});
