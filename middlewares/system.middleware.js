const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('../Logger/logger'); 
dotenv.config();

function create_storage_partition(token) {
    // This function creates storage partitions based on Token (inside upload folder)
    const token_directory = path.join(__dirname, '../uploads', token);
    if (!fs.existsSync(token_directory)) {
        fs.mkdirSync(token_directory, { recursive: true });
    }
    return token_directory;
}

const create_token_middleware = (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            const message = "You selected no files";
            logger('No files selected during upload', 'ERROR');  
            return res.status(400).render('home', { errorMessage: message });
        }

        const token = jwt.sign(
            { files: req.files.map(file => file.originalname) },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        const token_directory = create_storage_partition(token);
        logger(`Created storage partition for token: ${token}`, 'INFO');  

        req.files.forEach(file => {
            const tempPath = file.path;
            const finalPath = path.join(token_directory, file.originalname);
            fs.renameSync(tempPath, finalPath);
        });

        req.uploadToken = token;
        logger(`Token generated: ${token}`, 'INFO');  
        next();
    } catch (err) {
        logger(`Error in token generation: ${err.message}`, 'ERROR');  
        const message = "An error occurred during token generation.";
        return res.status(500).render('home', { errorMessage: message });
    }
};

const verify_token_middleware = (req, res, next) => {
    try {
        const token = req.params.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        logger(`Token verified: ${token}`, 'INFO'); 
        next();
    } catch (err) {
        logger(`Error in token verification: ${err.message}`, 'ERROR');  
        const message = "Token is invalid or expired. Please request a new one.";
        return res.status(400).render('404_page', { errorMessage: message });
    }
};

module.exports = {
    create_token_middleware,
    verify_token_middleware
};
