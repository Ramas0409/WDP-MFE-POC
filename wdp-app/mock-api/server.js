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
  { id: 'D-001', merchantName: 'Amazon Marketplace',   amount:  149.99, status: 'open',         date: '2024-01-15', category: 'Unauthorized Transaction', orgId: 'org-001', priority: 'high'   },
  { id: 'D-002', merchantName: 'Netflix',               amount:   15.99, status: 'under-review', date: '2024-01-16', category: 'Subscription',             orgId: 'org-002', priority: 'low'    },
  { id: 'D-003', merchantName: 'Uber Eats',             amount:   32.50, status: 'resolved',     date: '2024-01-17', category: 'Service Not Received',     orgId: 'org-003', priority: 'medium' },
  { id: 'D-004', merchantName: 'Apple Inc',             amount:  999.00, status: 'escalated',    date: '2024-01-18', category: 'Unauthorized Transaction', orgId: 'org-001', priority: 'high'   },
  { id: 'D-005', merchantName: 'Walmart Supercenter',   amount:  234.56, status: 'open',         date: '2024-01-19', category: 'Duplicate Charge',         orgId: 'org-002', priority: 'medium' },
  { id: 'D-006', merchantName: 'Delta Airlines',        amount:  450.00, status: 'under-review', date: '2024-01-20', category: 'Service Not Received',     orgId: 'org-004', priority: 'high'   },
  { id: 'D-007', merchantName: 'Spotify',               amount:    9.99, status: 'closed',       date: '2024-01-21', category: 'Subscription',             orgId: 'org-003', priority: 'low'    },
  { id: 'D-008', merchantName: 'Best Buy',              amount:  789.99, status: 'open',         date: '2024-01-22', category: 'Unauthorized Transaction', orgId: 'org-005', priority: 'high'   },
  { id: 'D-009', merchantName: 'DoorDash',              amount:   48.75, status: 'resolved',     date: '2024-01-22', category: 'Duplicate Charge',         orgId: 'org-001', priority: 'medium' },
  { id: 'D-010', merchantName: 'United Airlines',       amount: 1200.00, status: 'escalated',    date: '2024-01-23', category: 'Fraud',                    orgId: 'org-004', priority: 'high'   },
  { id: 'D-011', merchantName: 'Adobe Systems',         amount:   54.99, status: 'under-review', date: '2024-01-23', category: 'Subscription',             orgId: 'org-002', priority: 'low'    },
  { id: 'D-012', merchantName: 'Home Depot',            amount:  312.40, status: 'open',         date: '2024-01-24', category: 'Duplicate Charge',         orgId: 'org-003', priority: 'medium' },
  { id: 'D-013', merchantName: 'Lyft',                  amount:   28.50, status: 'resolved',     date: '2024-01-24', category: 'Unauthorized Transaction', orgId: 'org-005', priority: 'medium' },
  { id: 'D-014', merchantName: 'Microsoft Store',       amount:  129.99, status: 'closed',       date: '2024-01-25', category: 'Subscription',             orgId: 'org-001', priority: 'low'    },
  { id: 'D-015', merchantName: 'Hilton Hotels',         amount:  895.00, status: 'under-review', date: '2024-01-25', category: 'Service Not Received',     orgId: 'org-004', priority: 'high'   },
  { id: 'D-016', merchantName: 'Target',                amount:   87.30, status: 'open',         date: '2024-01-26', category: 'Duplicate Charge',         orgId: 'org-002', priority: 'medium' },
  { id: 'D-017', merchantName: 'PayPal Merchant',       amount: 2450.00, status: 'escalated',    date: '2024-01-26', category: 'Fraud',                    orgId: 'org-005', priority: 'high'   },
  { id: 'D-018', merchantName: 'Starbucks',             amount:   12.75, status: 'resolved',     date: '2024-01-27', category: 'Unauthorized Transaction', orgId: 'org-003', priority: 'low'    },
  { id: 'D-019', merchantName: 'Airbnb',                amount:  678.00, status: 'under-review', date: '2024-01-27', category: 'Service Not Received',     orgId: 'org-001', priority: 'high'   },
  { id: 'D-020', merchantName: 'Comcast',               amount:  145.00, status: 'open',         date: '2024-01-28', category: 'Duplicate Charge',         orgId: 'org-002', priority: 'medium' },
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
