import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize BullMQ Queue connected to Redis
const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    };

const incidentQueue = new Queue('incident-investigation-queue', {
  connection,
});
incidentQueue.on('error', (err) => {
  console.warn('[BullMQ] Queue warning/connection issue:', err.message);
});

// Health check endpoints for cloud load balancers (Render, Fly, AWS)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'contextops-core-api', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
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
    
    // Load dynamic service map from environment variable if available
    let serviceMap: Record<string, string> = {
      "payment-gateway": "sreejesh06/orythm"
    };
    
    if (process.env.SERVICE_REPO_MAP) {
      try {
        serviceMap = JSON.parse(process.env.SERVICE_REPO_MAP);
      } catch (e) {
        console.warn("Invalid JSON in SERVICE_REPO_MAP environment variable");
      }
    }

    const service = payload.service || '';
    const githubRepo = serviceMap[service] || process.env.DEFAULT_GITHUB_REPO || "sreejesh06/orythm"; // fallback

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

// Get all incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get single incident with logs
app.get('/api/incidents/:id', async (req, res) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: { logs: { orderBy: { created_at: 'asc' } } }
    });
    if (!incident) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// Update incident status
app.patch('/api/incidents/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
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
const redisSubscriber = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error', err));

async function setupRedisSubscriber() {
  console.log('Connected to Redis Pub/Sub');
  
  await redisSubscriber.subscribe('incident_updates');
  redisSubscriber.on('message', async (channel, message) => {
    if (channel === 'incident_updates') {
      console.log(`[Redis] Received: ${message}`);
      
      try {
        const parsed = JSON.parse(message);
        if (parsed.incidentId && parsed.message) {
          await prisma.investigationLog.create({
            data: {
              incident_id: parsed.incidentId,
              message: parsed.message
            }
          });
        }
      } catch (e) {
        console.error('Error parsing or saving investigation log:', e);
      }

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
const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`Core API running on http://0.0.0.0:${PORT}`);
  console.log(`WebSocket server running on ws://0.0.0.0:${PORT}`);
  
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
