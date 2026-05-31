const express = require('express');
const cors = require('cors');
const client = require('prom-client');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// ------------------ METRICS SETUP ------------------

// Create registry
const register = new client.Registry();

// Collect default system metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// HTTP request counter (with labels → professional)
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route']
});

// Queue size metric
const queueSizeGauge = new client.Gauge({
  name: 'queue_size',
  help: 'Current number of messages in queue'
});

// Register metrics
register.registerMetric(httpRequestCounter);
register.registerMetric(queueSizeGauge);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ---------------------------------------------------

// In-memory queue
const queue = [];

// Root endpoint
app.get('/', (req, res) => {
  httpRequestCounter.inc({ method: req.method, route: '/' });
  res.send('Backend API is running.');
});

// POST /add → Add message
app.post('/add', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  httpRequestCounter.inc({ method: req.method, route: '/add' });

  queue.push(message);

  // Update queue size metric
  queueSizeGauge.set(queue.length);

  console.log(`[Backend] Message added: ${message}`);

  res.status(201).json({
    status: 'success',
    currentQueue: queue
  });
});

// GET /queue → View messages
app.get('/queue', (req, res) => {
  httpRequestCounter.inc({ method: req.method, route: '/queue' });

  // Update queue size metric
  queueSizeGauge.set(queue.length);

  res.json({ queue });
});

app.listen(port, () => {
  console.log(`Backend service listening at http://localhost:${port}`);
});
