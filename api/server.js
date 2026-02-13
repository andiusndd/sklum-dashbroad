const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Path resolution (Vercel api structure)
const storagePath = path.join(process.cwd(), 'localstorage.json');

// Helper to get Sheet ID
function getSheetId() {
    if (fs.existsSync(storagePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
            if (data.SHEET_ID) return data.SHEET_ID;
        } catch (e) {}
    }
    return process.env.SHEET_ID || '1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c';
}

// Global Credentials
let CREDENTIALS = null;
try {
    if (process.env.GOOGLE_CREDENTIALS) {
        CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        if (CREDENTIALS.private_key) {
            CREDENTIALS.private_key = CREDENTIALS.private_key.replace(/\\n/g, '\n');
        }
    }
} catch (e) {
    console.error("Credentials parse error:", e);
}

// API Routes
app.get('/api/data', async (req, res) => {
    try {
        if (!CREDENTIALS) {
            return res.status(500).json({ error: "Missing GOOGLE_CREDENTIALS" });
        }

        const auth = new google.auth.GoogleAuth({
            credentials: CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        const sheetId = getSheetId();

        const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        const targetSheet = meta.data.sheets.find(s => s.properties.title === 'Project Timeline') || meta.data.sheets[0];
        const sheetName = targetSheet.properties.title;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${sheetName}!A1:AZ5000`,
        });

        const rows = response.data.values || [];
        if (rows.length === 0) return res.json({ data: [], metadata: { sheet: sheetName, sheetId } });

        const headers = rows[0];
        const data = rows.slice(1)
            .filter(row => row.length > 0 && (row[0] || row[3]))
            .map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    if (!header) return;
                    const key = header.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    obj[key] = row[index] || '';
                });
                return obj;
            });

        res.json({ data, metadata: { spreadsheet: meta.data.properties.title, sheet: sheetName, sheetId, count: data.length, updatedAt: new Date().toISOString() } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/save-config', (req, res) => {
    const { sheetId } = req.body;
    if (!sheetId) return res.status(400).json({ error: 'Missing sheetId' });

    const data = { SHEET_ID: sheetId, updatedAt: new Date().toISOString() };
    try {
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
    } catch (e) {}

    res.json({ success: true, message: 'Updated in session' });
});

module.exports = app;
