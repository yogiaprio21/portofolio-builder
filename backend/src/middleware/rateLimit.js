function createRateLimiter({ windowMs, max, keyPrefix = 'default', message }) {
  const buckets = new Map();
  let requestCount = 0;

  return function rateLimit(req, res, next) {
    if (req.method === 'OPTIONS') return next();

    const now = Date.now();
    requestCount += 1;

    if (requestCount % 500 === 0) {
      for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) buckets.delete(key);
      }
    }

    const key = `${keyPrefix}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    const current = buckets.get(key);
    const bucket =
      current && current.resetAt > now
        ? current
        : { count: 0, resetAt: now + windowMs };

    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(max - bucket.count, 0);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({
        error: message || 'Too many requests, please try again later'
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
