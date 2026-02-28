const express = require('express');
const cors = require('cors');
const path = require('path');

const portfoliosRoute = require('./routes/portfolios');
const templatesRoute = require('./routes/templates');
const uploadRoute = require('./routes/upload');
const aiRoute = require('./routes/ai');
const apiPortfoliosRoute = require('./routes/apiPortfolios');
const authRoute = require('./routes/auth');
const myPortfoliosRoute = require('./routes/myPortfolios');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions = allowedOrigins.length
  ? { origin: allowedOrigins, credentials: true }
  : {};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads')));

app.use('/portfolios', portfoliosRoute);
app.use('/templates', templatesRoute);
app.use('/upload', uploadRoute);
app.use('/ai', aiRoute);
app.use('/api/portfolios', apiPortfoliosRoute);
app.use('/api/my/portfolios', myPortfoliosRoute);
app.use('/auth', authRoute);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;
