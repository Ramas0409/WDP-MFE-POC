const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Request logger – prints every incoming call to stdout
app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Mock data ───────────────────────────────────────────────────────────────

const disputes = [
  {
    id: 'D-001',
    merchantName: 'Amazon Marketplace',
    amount: 149.99,
    status: 'open'
  },
  {
    id: 'D-002',
    merchantName: 'Netflix Subscription',
    amount: 15.99,
    status: 'under-review'
  },
  {
    id: 'D-003',
    merchantName: 'Uber Eats',
    amount: 32.50,
    status: 'resolved'
  }
];

// ── Routes ──────────────────────────────────────────────────────────────────

app.get('/disputes', (req, res) => {
  res.json(disputes);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Mock Disputes API — port ' + PORT + '      ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
  console.log('  GET /disputes  →  returns ' + disputes.length + ' mock disputes');
  console.log('  GET /health    →  health check');
  console.log('');
});
