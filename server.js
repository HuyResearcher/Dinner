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
    try {
        // Read file synchronously with proper error handling
        const rawData = fs.readFileSync(dataFile, 'utf8');
        const data = JSON.parse(rawData);
        res.json(data);
    } catch (error) {
        console.error('Error reading responses:', error);
        res.status(500).json({ error: 'Failed to read responses' });
    }
});

// Save new response
app.post('/api/responses', (req, res) => {
    try {
        // Read existing data
        const rawData = fs.readFileSync(dataFile, 'utf8');
        const data = JSON.parse(rawData);
        
        // Add new response with timestamp and IP
        const newResponse = {
            ...req.body,
            id: Date.now(),
            ip: req.ip,
            timestamp: new Date().toISOString()
        };
        
        data.push(newResponse);

        // Write back to file
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
        
        // Send all responses back
        res.json({ success: true, data: data });
    } catch (error) {
        console.error('Error saving response:', error);
        res.status(500).json({ error: 'Failed to save response' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});