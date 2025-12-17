const express = require('express');
const AuthController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.patch(
  '/change-password',
  auth,                 // must be logged in
  AuthController.changePassword
);


module.exports = router;
