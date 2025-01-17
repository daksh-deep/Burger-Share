const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const logger = require('../Logger/logger'); 

// Express router
const router = express.Router();

// Define the URL for the keep-alive request
const url = process.env.KEEP_ALIVE_URL;

// Keep-alive route
router.get('/', async (req, res) => {
    logger('Keep-alive request - Received', 'KEEP ALIVE');
    res.status(200).json({ message: "Keep-alive request received" });

    try {
        const response = await axios.get(url);
        logger(`Keep-alive request - Sent - ${url}`, 'KEEP ALIVE');
    } catch (err) {
        logger(`Keep-alive request failed: ${err.message}`, 'ERROR');
    }
});

module.exports = router;
