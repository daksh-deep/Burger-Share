const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const LOG_FILE = process.env.LOG_FILE || path.join(__dirname, 'logs.log');

const logger = (message, level = 'INFO') => {
    const timestamp = new Date().toISOString();
    const entry = `[${level}] ${timestamp} - ${message}`;

    // Log to console
    console.log(entry);

    // Append to the log file
    try {
        fs.appendFileSync(LOG_FILE, entry + '\n', 'utf8');
    } catch (error) {
        console.error(`Failed to write log: ${error.message}`);
    }
};

module.exports = logger;
