const http = require('http');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 1. Load Environment Variables & Local Storage
let env = {};
const envPath = path.join(__dirname, '..', '.env.local');
const storagePath = path.join(__dirname, '..', 'localstorage.json');
const jsonCredsPath = path.join(__dirname, '..', 'divine-glazing-451115-a0-f69d04cbf7ee.json');

// Helper to get current Sheet ID with priority: localstorage.json > .env.local > Default
function getSheetId() {
    // 1. Try localstorage.json
    if (fs.existsSync(storagePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
            if (data.SHEET_ID) return data.SHEET_ID;
        } catch (e) {
            console.error("Error reading localstorage.json:", e);
        }
    }

    // 2. Try .env.local
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        let envId = null;
        envContent.split('\n').forEach(line => {
             if (line.trim().startsWith('SHEET_ID=')) {
                 const parts = line.split('=');
                 if(parts.length > 1) {
                     let val = parts.slice(1).join('=').trim();
                     if((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
                         val = val.substring(1, val.length -1);
                     }
                     envId = val;
                 }
             }
        });
        if (envId) return envId;
    }
    
    // 3. Try process.env (Vercel)
    if (process.env.SHEET_ID) return process.env.SHEET_ID;

    // 4. Fallback
    return '1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c';
}

// 2. Resolve Credentials
let CREDENTIALS = null;
if (fs.existsSync(jsonCredsPath)) {
    console.log("Loading credentials from JSON file...");
    try {
        CREDENTIALS = JSON.parse(fs.readFileSync(jsonCredsPath, 'utf8'));
    } catch (e) {
        console.error("Error parsing JSON credentials file:", e);
    }
} else if (process.env.GOOGLE_CREDENTIALS) {
    console.log("Loading credentials from environment variables...");
    try {
        // Handle potential stringified JSON in env var
        CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } catch (e) {
        console.error("Failed to parse GOOGLE_CREDENTIALS env var:", e);
    }
}

// Fix newline in private key
if (CREDENTIALS.private_key) {
    CREDENTIALS.private_key = CREDENTIALS.private_key.replace(/\\n/g, '\n');
}

// Initialize Google Sheets Client
const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });

// 3. Define Request Handler (Decoupled for Vercel)
const handler = async (req, res) => {
    // Parse URL to handle query parameters
    const protocol = req.socket.encrypted ? 'https' : 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;
    const parsedUrl = new URL(req.url, baseUrl);
    const pathname = parsedUrl.pathname;

    // A. Serve API Endpoints
    if (pathname === '/api/save-config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { sheetId } = JSON.parse(body);
                if (!sheetId) { 
                    res.writeHead(400); res.end(JSON.stringify({ error: 'Missing sheetId' })); return; 
                }

                if (!CREDENTIALS) {
                    throw new Error("Google Credentials not configured on server");
                }

                // Save to localstorage.json (Try/Catch for Vercel read-only FS)
                const data = { SHEET_ID: sheetId, updatedAt: new Date().toISOString() };
                try {
                    fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
                    console.log(`Updated SHEET_ID in localstorage.json to: ${sheetId}`);
                } catch (fsErr) {
                    console.warn("Could not write to localstorage.json (expected on Vercel):", fsErr.message);
                    // On Vercel, we can't persist files, but we can continue the request
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Sheet ID updated in session',
                    note: 'Changes may not persist permanently on Vercel. Update Env Vars for permanent change.'
                }));
            } catch (err) {
                console.error("Save Error:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Failed to save configuration' }));
            }
        });
        return;
    }

    if (pathname === '/api/data') {
        try {
            if (!CREDENTIALS) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: "SERVER_NOT_CONFIGURED", 
                    message: "Google credentials are missing. Please set GOOGLE_CREDENTIALS in Vercel Environment Variables." 
                }));
                return;
            }

            const currentSheetId = getSheetId(); // Dynamic fetch
            
            console.log(`Using Sheet ID: ${currentSheetId}`);
            
            // 1. Get Spreadsheet Metadata
            const meta = await sheets.spreadsheets.get({
                spreadsheetId: currentSheetId
            });
            
            // Try to find "Project Timeline" or use the first sheet
            const targetSheet = meta.data.sheets.find(s => s.properties.title === 'Project Timeline') || meta.data.sheets[0];
            const sheetName = targetSheet.properties.title;
            
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: currentSheetId,
                range: `${sheetName}!A1:AZ5000`, 
            });

            // ... (Data processing logic remains same) ...
            
            const rows = response.data.values || [];
            if (rows.length === 0) {
                 res.writeHead(200, { 
                     'Content-Type': 'application/json',
                     'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                 });
                 res.end(JSON.stringify({ data: [], metadata: { sheet: sheetName, sheetId: currentSheetId } }));
                 return;
            }

             const headers = rows[0];
             // ... data process ...
             const data = rows.slice(1)
                .filter(row => row.length > 0 && (row[0] || row[3])) 
                .map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        if (!header) return;
                        const key = header.toLowerCase()
                            .trim()
                            .replace(/\s+/g, '_')
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9_]/g, ''); 
                        obj[key] = row[index] || '';
                    });
                    return obj;
                });

            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            });
            res.end(JSON.stringify({ 
                data, 
                metadata: { 
                    spreadsheet: meta.data.properties.title,
                    sheet: sheetName, 
                    sheetId: currentSheetId, 
                    count: data.length,
                    updatedAt: new Date().toISOString()
                } 
            }));
            // ...
        } catch (error) {
            console.error("API Error:", error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // B. Serve Dashboard HTML & Static Files
    let filePath = '';
    let contentType = 'text/html';

    if (pathname === '/' || pathname === '/index.html') {
        filePath = path.join(__dirname, '..', 'index.html');
    } else {
        // Simple Static File Server
        const extname = path.extname(pathname).toLowerCase();
        const supportedExtensions = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.apng': 'image/apng',
            '.ico': 'image/x-icon',
            '.css': 'text/css',
            '.js': 'text/javascript'
        };

        if (supportedExtensions[extname]) {
            filePath = path.join(__dirname, '..', pathname.substring(1));
            contentType = supportedExtensions[extname];
        }
    }

    if (filePath) {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('Not Found');
                } else {
                    res.writeHead(500);
                    res.end(`Error loading ${req.url}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
        return;
    }

    // C. 404 Route
    res.writeHead(404);
    res.end('Not Found');
};

// 4. Start Server (Local) or Export (Vercel)
if (require.main === module) {
    const port = process.env.PORT || 3000;
    const server = http.createServer(handler);
    server.listen(port, () => {
        console.log(`Standalone Dashboard running at: http://localhost:${port}`);
    });
} else {
    module.exports = handler;
}
