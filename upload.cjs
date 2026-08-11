const ftp = require("basic-ftp");
const path = require("path");

async function upload() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log("Connecting to InfinityFree FTP...");
        await client.access({
            host: "ftpupload.net",
            user: "if0_42530530",
            password: "Qwaszxerdf11",
            secure: false
        });
        
        console.log("Connected to FTP! Uploading backend folder...");
        
        // Navigate to htdocs
        await client.ensureDir("htdocs");
        await client.ensureDir("backend");
        
        // Upload the backend directory from local
        await client.uploadFromDir(path.join(__dirname, "backend"));
        
        console.log("Upload complete! Renaming .env.production to env.ini...");
        
        // Try to rename .env.production to env.ini on the server
        try {
            await client.rename("htdocs/backend/.env.production", "htdocs/backend/env.ini");
            console.log("Successfully renamed .env.production to env.ini!");
        } catch (e) {
            console.log("Note: Could not rename .env.production (it might already be renamed or missing).");
        }
        
        console.log("Deployment finished successfully!");
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

upload();
