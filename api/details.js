const axios = require('axios');
const cors = require('cors');

module.exports = async (req, res) => {
  cors()(req, res, async () => {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required' });
    }
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`
        + `?place_id=${placeId}`
        + `&fields=opening_hours`
        + `&key=${process.env.GOOGLE_API_KEY}`;
      const { data } = await axios.get(detailsUrl);
      return res.json({ result: data.result });
    } catch (error) {
      console.error('❌ Error in /api/details:', error.message);
      return res.status(500).json({
        error: 'Failed to fetch place details',
        details: error.message
      });
    }
  });
};
