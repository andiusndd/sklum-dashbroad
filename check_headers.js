 const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function checkHeaders() {
    const jsonCredsPath = path.join(__dirname, 'divine-glazing-451115-a0-f69d04cbf7ee.json');
    const SHEET_ID = '1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c';
    const CREDENTIALS = JSON.parse(fs.readFileSync(jsonCredsPath, 'utf8'));

    const auth = new google.auth.GoogleAuth({
        credentials: CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const targetSheet = meta.data.sheets.find(s => s.properties.title === 'Project Timeline') || meta.data.sheets[0];
    const sheetName = targetSheet.properties.title;
    console.log(`Checking Sheet: ${sheetName}`);
    
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1:AZ1`,
    });

    const headers = response.data.values[0];
    headers.forEach((h, i) => {
        console.log(`${String.fromCharCode(65 + i)} (${i}): ${h}`);
    });
}

checkHeaders().catch(console.error);
