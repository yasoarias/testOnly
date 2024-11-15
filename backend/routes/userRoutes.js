const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Add this route
router.put('/update-profile', authMiddleware, userController.updateProfile);

module.exports = router; 