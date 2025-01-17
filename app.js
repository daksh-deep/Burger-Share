const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const favicon = require('express-favicon');
const cron = require('node-cron');
const systemRoutes = require('./routes/system.routes');
const logger = require('./Logger/logger');  
const cleanDirectory = require('./clean');
const healthRoutes = require('./routes/healthRoutes');

// Initialization
dotenv.config();
const app = express();

// Function to create directory if it doesn't exist
const createDirectoryIfNotExists = (dirPath, isLogsDir = false) => {
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            // Only log if we're not creating the logs directory
            if (!isLogsDir) {
                logger(`Created directory: ${dirPath}`, 'INFO');
            } else {
                console.log('Created logs directory');
            }
        } catch (err) {
            if (!isLogsDir) {
                logger(`Failed to create directory ${dirPath}: ${err.message}`, 'ERROR');
            }
            console.error(`Failed to create directory ${dirPath}: ${err.message}`);
            throw new Error(`Failed to create required directory: ${dirPath}`);
        }
    }
};

// Function to initialize required directories
const initializeDirectories = () => {
    // Create logs directory first
    const logsDir = path.join(__dirname, 'logs');
    createDirectoryIfNotExists(logsDir, true);

    // Then create other directories with logging enabled
    const otherDirectories = [
        path.join(__dirname, 'uploads'),
        path.join(__dirname, 'uploads', 'temp')
    ];

    otherDirectories.forEach(dir => createDirectoryIfNotExists(dir, false));
};

// Function to start the server
const startServer = () => {
    const port = process.env.PORT || 3000;
    
    app.listen(port, () => {
        try {
            logger(`Server successfully started on port ${port}`, 'INFO');
            console.log('Backend is up and running!');
        } catch (err) {
            logger(`Server startup failed: ${err.message}`, 'ERROR');
            console.log(`Error during startup: ${err.message}`);
            process.exit(1);
        }
    });
};

// Initialize CRON job for directory cleaning
const initializeCronJob = () => {
    // Run every 2 hours: At minute 0 of every 2nd hour
    cron.schedule('0 */2 * * *', () => {
        try {
            logger('Starting scheduled directory cleanup', 'INFO');
            cleanDirectory();
            logger('Completed scheduled directory cleanup', 'INFO');
        } catch (err) {
            logger(`Error during scheduled cleanup: ${err.message}`, 'ERROR');
        }
    });
    logger('Initialized CRON job for directory cleanup', 'INFO');
};

// Server Setup
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// Routes
app.use('/health', healthRoutes);
app.use('/', systemRoutes);

// Initialize application
const initialize = async () => {
    try {
        // Initialize required directories
        initializeDirectories();
        
        // Setup CRON jobs
        initializeCronJob();
                
        // Start the server
        startServer();
    } catch (err) {
        console.error('Failed to initialize application:', err);
        process.exit(1);
    }
};

// Start initialization
initialize();