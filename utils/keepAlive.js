const axios = require('axios');
const cron = require('node-cron');
const dotenv = require('dotenv');
const logger = require('../Logger/logger');
dotenv.config();

/**
 * Sets up a cron job to periodically send a keep-alive request to a specified URL.
 * 
 * This function uses the `node-cron` library to schedule a task that sends an HTTPS
 * GET request to the URL specified in the environment variable `KEEP_ALIVE_URL`.
 * The task runs every 10 minutes to ensure the target service remains active, even
 * when idle for extended periods.
 * 
 * The cron job logs:
 * - A success message when the request is successfully sent.
 * - An error message if the request fails.
 * 
 * Preconditions:
 * - The `KEEP_ALIVE_URL` environment variable must be defined and valid.
 * 
 * Usage:
 * - Import and invoke the `keepAlive` function in your application to start the cron job.
 * 
 * Example:
 * ```
 * const keepAlive = require('./utils/keepAlive');
 * keepAlive();
 * ```
 * 
 * Logs:
 * - INFO: Successful keep-alive requests.
 * - ERROR: Failed keep-alive requests.
 */
const keepAlive = () => {
    const url = process.env.KEEP_ALIVE_URL;

    if (!url) {
        throw new Error('KEEP_ALIVE_URL is not defined in environment variables.');
    }

    cron.schedule('*/10 * * * *', async () => {
        try {
            const response = await axios.get(url); // Use axios for the GET request
            logger(`Keep-alive request successfully sent to ${url}`, 'INFO');
        } catch (err) {
            logger(`Keep-alive request failed: ${err.message}`, 'ERROR');
        }
    });
};

module.exports = keepAlive;
