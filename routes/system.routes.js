const path = require('path');
const express = require('express');
const multer = require('multer');
const { handleUpload, handleShare } = require('../controllers/system.controller');
const { create_token_middleware, verify_token_middleware } = require('../middlewares/system.middleware');
const logger = require('../Logger/logger');  

// Express router
const router = express.Router();

// Custom multer diskstorage
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            const TEMP_PATH = path.join(__dirname, '../uploads/temp');
            return callback(null, TEMP_PATH);
        },
        filename: (req, file, callback) => {
            const custom_file_name = `${Date.now()} - ${Math.floor(Math.random() * 100)} - ${file.originalname}`;
            return callback(null, custom_file_name);
        }
    })
});

// Routes
router.get('/', (req, res) => {
    const errorMessage = req.query.errorMessage || null;
    res.render('home', { errorMessage });
    logger('Visited the home page', 'INFO');
});

router.post('/system', upload.any(''), create_token_middleware, handleUpload);
router.get('/system/:token', verify_token_middleware, handleShare);

router.get('/about', (req, res) => {
    res.render('about');
    logger('Visited the about page', 'INFO');
});

router.get("*", (req, res) => {
    logger('404 page not found', 'ERROR');
    res.render('404_page.ejs', { errorMessage: null });
});

router.get('/uploads/:token/:file', (req, res) => {
    const { token, file } = req.params;
    const tokenDirectory = path.join(UPLOADS_PATH, token);
    const filePath = path.join(tokenDirectory, file);

    if (fs.existsSync(filePath)) {
        res.download(filePath, file, (err) => {
            if (err) {
                logger(`Error in file download: ${err.message}`, 'ERROR');
                res.status(500).send("Error downloading file.");
            } else {
                logger(`File downloaded: ${file} for token: ${token}`, 'INFO');
            }
        });
    } else {
        logger(`File not found: ${file} for token: ${token}`, 'ERROR');
        res.status(404).render('404_page');
    }
});

module.exports = router;