/**
 * Nature Guardians / להצליח עם חיוך - Lightweight Local Web Server
 * Serves index.html, style.css, js, and encrypted game payloads on port 8000.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
    // Decode URI to support Hebrew characters in file names
    let decodedUrl;
    try {
        decodedUrl = decodeURIComponent(req.url);
    } catch (e) {
        decodedUrl = req.url;
    }

    // Default to index.html
    const requestPath = decodedUrl === '/' ? 'index.html' : decodedUrl;
    let filePath = path.join(__dirname, requestPath);

    // Security check: prevent directory traversal outside workspace
    if (!filePath.startsWith(__dirname)) {
        res.statusCode = 403;
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Access Denied - גישה אסורה');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('File Not Found - הקובץ לא נמצא');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server successfully started!`);
    console.log(`Open in browser: http://localhost:${PORT}`);
});
