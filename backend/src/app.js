const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const healthRouter        = require('./routes/health');
const eventsRouter        = require('./routes/events');
const registrationsRouter = require('./routes/registrations');
const paymentsRouter      = require('./routes/payments');
const adminRouter         = require('./routes/admin');
const galleryRouter       = require('./routes/gallery');
const rulebookRouter      = require('./routes/rulebook');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health',  healthRouter);
app.use('/api/events',  eventsRouter);
app.use('/api',         registrationsRouter);
app.use('/api',         paymentsRouter);
app.use('/api/admin',    adminRouter);
app.use('/api/gallery',  galleryRouter);
app.use('/api/rulebook', rulebookRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
