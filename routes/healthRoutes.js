const express = require('express');
const logger = require('../Logger/logger');  

// Express router
const router = express.Router();

// Keep-alive route
router.get('/', (req, res) => {
    logger('Received a keep-alive request', 'INFO');
    res.status(200).json({ message: "Keep-alive request received" });
});

// Handle 404 for undefined routes
router.all('*', (req, res) => {
    res.status(404).json({ message: 'Not Found', status: "404" });
});

module.exports = router;