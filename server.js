const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Local API Route for Testing
app.get('/api/restaurants', require('./api/restaurants'));
app.get('/api/details', require('./api/details'));

app.listen(PORT, () => {
    console.log(`🚀 Local server running on http://localhost:${PORT}`);
});