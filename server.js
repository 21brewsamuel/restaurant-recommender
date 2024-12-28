const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Verify API Route
app.get('/api/restaurants', async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        console.error('❌ Missing lat or lng parameters');
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    try {
        const query = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=restaurant&key=${process.env.GOOGLE_API_KEY}`;
        console.log('🛠️ API Query:', query);

        const response = await axios.get(query);
        console.log('✅ Google API Response Status:', response.data.status);

        res.json({ results: response.data.results });
    } catch (error) {
        console.error('❌ Axios Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch restaurants', details: error.message });
    }
});

// Default Route for Testing
app.get('/', (req, res) => {
    res.send('✅ Server is up and running!');
});

// Start Server (Local Only)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
