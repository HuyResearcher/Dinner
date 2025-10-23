const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Path to our data file
const dataFile = path.join(__dirname, 'responses.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([]));
}

// Get all responses
app.get('/api/responses', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFile));
    res.json(data);
});

// Save new response
app.post('/api/responses', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFile));
    data.push({
        ...req.body,
        id: Date.now() // Add unique ID
    });
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});