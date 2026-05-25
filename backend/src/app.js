const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const { createRateLimiter } = require('./middleware/rateLimit');
const { securityHeaders } = require('./middleware/securityHeaders');
const { requestContext } = require('./middleware/requestContext');
const { requestLogger } = require('./middleware/requestLogger');
const { sequelize } = require('./config/sequelize');
const logger = require('./utils/logger');
const { getReadiness } = require('./state/readiness');

const portfoliosRoute = require('./routes/portfolios');
const templatesRoute = require('./routes/templates');
const uploadRoute = require('./routes/upload');
const aiRoute = require('./routes/ai');
const apiPortfoliosRoute = require('./routes/apiPortfolios');
const authRoute = require('./routes/auth');
const myPortfoliosRoute = require('./routes/myPortfolios');

const app = express();

app.disable('x-powered-by');
if (config.trustProxy) {
  const trustProxy = config.trustProxy === 'true' ? true : config.trustProxy;
  app.set('trust proxy', trustProxy);
}

const corsOptions = {
  credentials: true,
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (!config.corsOrigins.length && !config.isProduction) return cb(null, true);
    return cb(null, config.corsOrigins.includes(origin));
  }
};

const apiLimiter = createRateLimiter({
  ...config.rateLimits.api,
  keyPrefix: 'api'
});
const authLimiter = createRateLimiter({
  ...config.rateLimits.auth,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts, please try again later'
});
const uploadLimiter = createRateLimiter({
  ...config.rateLimits.upload,
  keyPrefix: 'upload',
  message: 'Too many upload attempts, please try again later'
});
const aiLimiter = createRateLimiter({
  ...config.rateLimits.ai,
  keyPrefix: 'ai',
  message: 'Too many AI parsing attempts, please try again later'
});

app.use(requestContext);
app.use(requestLogger);
app.use(securityHeaders({ isProduction: config.isProduction }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/readyz', async (req, res) => {
  const readiness = getReadiness();
  if (!readiness.ready) {
    return res.status(503).json({ ok: false, ...readiness });
  }
  try {
    await sequelize.authenticate();
    res.json({ ok: true, ...readiness, database: 'ok' });
  } catch (err) {
    logger.error('Readiness check failed', { requestId: req.requestId, error: err.message });
    res.status(503).json({ ok: false, database: 'unavailable' });
  }
});
app.use('/auth', authLimiter);
app.use('/upload', uploadLimiter);
app.use('/ai', aiLimiter);
app.use(apiLimiter);
app.use(express.json({ limit: config.jsonBodyLimit }));
app.use('/uploads', express.static(path.resolve(config.uploadDir), {
  dotfiles: 'deny',
  maxAge: config.isProduction ? '1d' : 0,
  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

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
  logger.error('Unhandled error', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    error: err.message
  });
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;
