const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { requireAuth } = require('../middleware/jwtAuth');
const { emailField, passwordField, validateBody } = require('../middleware/validate');

router.post('/register', validateBody({ email: emailField, password: passwordField }), controller.register);
router.post('/login', validateBody({ email: emailField, password: passwordField }), controller.login);
router.post('/logout', controller.logout);
router.post('/refresh', controller.refresh);
router.post('/resend-verification', validateBody({ email: emailField }), controller.resendVerification);
router.get('/verify', controller.verifyEmail);
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user.sub, email: req.user.email, role: req.user.role } });
});

module.exports = router;
