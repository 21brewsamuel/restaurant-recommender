const axios = require('axios');
const cors = require('cors');

module.exports = async (req, res) => {
  // Enable CORS
  cors()(req, res, async () => {
    const { lat, lng, minprice, maxprice, keyword } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: 'Latitude and Longitude are required' });
    }

    try {
      let query =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
        + `?location=${lat},${lng}`
        + `&radius=3000`
        + `&type=restaurant`
        + `&key=${process.env.GOOGLE_API_KEY}`;

      // Price filters
      if (minprice !== undefined && minprice !== '') {
        query += `&minprice=${minprice}`;
      }
      if (maxprice !== undefined && maxprice !== '') {
        query += `&maxprice=${maxprice}`;
      }

      // Cuisine keyword
      if (keyword) {
        query += `&keyword=${keyword}`;
      }

      console.log('Nearby Search Query:', query);
      const response = await axios.get(query);

      return res.json({ results: response.data.results });
    } catch (error) {
      console.error('❌ Error in /api/restaurants:', error.message);
      return res.status(500).json({
        error: 'Failed to fetch restaurants',
        details: error.message
      });
    }
  });
};
