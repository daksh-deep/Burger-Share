const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function getDirectories(dirPath) {
    return fs.readdirSync(dirPath)
      .filter(item => fs.statSync(path.join(dirPath, item)).isDirectory());
}

const cleanDirectory = () => {

    // Get targetDir from Environment Variables (CLEAN_DIR_PATH)
    const targetDir = process.env.CLEAN_DIR_PATH;
    const directories = getDirectories(targetDir);

    for (let i = 0; i < directories.length; i++) {
        const dir = directories[i];

        // Skip the 'temp' directory
        if (dir === 'temp') {
            continue;
        }

        try {
            // Decode the JWT
            const decoded = jwt.verify(dir, process.env.JWT_SECRET);

            const currentTime = Math.floor(Date.now() / 1000);
            const expirationTime = decoded.exp;

            // Check if the token has expired
            if (expirationTime < currentTime) {
                // Token has expired, clean up the directory
                console.log(`Token has expired. Cleaning up expired directory: ${dir}`);
                fs.rmSync(path.join(targetDir, dir), { recursive: true, force: true }); 
            } else {
                console.log(`Directory ${dir} is still valid, waiting...`);
            }
        } catch (err) {
            console.error(`Invalid or expired JWT in directory: ${dir}. Deleting directory...`);
            fs.rmSync(path.join(targetDir, dir), { recursive: true, force: true }); 
        }
    }
};

module.exports = cleanDirectory;
