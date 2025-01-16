const path = require('path');
const fs = require('fs');
const logger = require('../Logger/logger');  

const handleUpload = (req, res) => {
    try {
        const token = req.uploadToken;

        if (!token) {
            const message = "Token generation failed";
            logger('Token generation failed', 'ERROR');
            return res.status(400).render('home', { errorMessage: message });
        }

        const baseURL = `${req.protocol}://${req.get('host')}`;
        const shareableURL = `${baseURL}/system/${token}`;
        
        logger(`Shareable URL generated: ${shareableURL}`, 'INFO'); 
        res.status(200).render('share_url', { url: shareableURL });

    } catch (err) { 
        const errorMessage = "An unexpected error occurred. Please try again.";
        logger(`Error during upload: ${err.message}`, 'ERROR');  
        res.status(400).render('home', { errorMessage: errorMessage });
    }
};

const handleShare = (req, res) => {
    try {
        const token = req.params.token;
        const token_directory = path.join(__dirname, '../uploads', token);

        // Check if the token directory exists (done in Middleware)

        // Get files from directory
        const files = fs.readdirSync(token_directory);
        
        logger(`Files shared for token: ${token}`, 'INFO');  
        res.status(400).render('share_files', { files: files, token: token });

    } catch (err) {
        logger(`Error during file share: ${err.message}`, 'ERROR'); 
        res.status(400).render('404_page'); 
    }
}

module.exports = {
    handleUpload,
    handleShare
};
