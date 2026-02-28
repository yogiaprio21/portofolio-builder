module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expected = process.env.API_TOKEN || '';
  if (!expected) return res.status(500).json({ error: 'Server not configured' });
  if (token !== expected) return res.status(401).json({ error: 'Unauthorized' });
  next();
};
