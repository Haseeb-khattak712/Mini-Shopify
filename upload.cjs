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
        
        console.log("Uploading database configuration (.env.production)...");
        try {
            await client.uploadFrom(path.join(__dirname, ".env.production"), "env.ini");
            console.log("Successfully uploaded database config to env.ini!");
        } catch (e) {
            console.log("Error uploading .env.production:", e);
        }
        
        console.log("Deployment finished successfully!");
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

upload();
