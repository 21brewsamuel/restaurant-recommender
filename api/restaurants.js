const axios = require('axios');
const cors = require('cors');

module.exports = async (req, res) => {
    // Enable CORS
    cors()(req, res, async () => {
        const { lat, lng, minprice, maxprice } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and Longitude are required' });
        }

        try {
            let query = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=restaurant&key=${process.env.GOOGLE_API_KEY}`;

            if (minprice) query += `&minprice=${minprice}`;
            if (maxprice) query += `&maxprice=${maxprice}`;

            console.log('🛠️ API Query:', query);

            const response = await axios.get(query);

            return res.json({ results: response.data.results });
        } catch (error) {
            console.error('❌ Axios Error:', error.response?.data || error.message);
            return res.status(500).json({ error: 'Failed to fetch restaurants', details: error.message });
        }
    });
};