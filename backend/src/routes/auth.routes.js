const express = require('express');
const AuthController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const { setCSRFToken } = require('../middleware/csrf.middleware');
const router = express.Router();

// CSRF token endpoint - must be called before any state-changing requests
router.get('/csrf', setCSRFToken, (req, res) => {
  res.json({
    success: true,
    data: { csrfToken: req.csrfToken },
    message: 'CSRF token generated',
  });
});

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.patch(
  '/change-password',
  auth,                 // must be logged in
  AuthController.changePassword
);


module.exports = router;
