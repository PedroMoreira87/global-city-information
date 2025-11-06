import axios from 'axios';

const generateResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': 'https://d2u17pmw1fxael.cloudfront.net',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  try {
    const parsedBody = event.body ? JSON.parse(event.body) : {};
    const { cityInput } = parsedBody;
    if (!cityInput) {
      return generateResponse(400, { error: 'CityInput is required.' });
    }
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured');
    }
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${apiKey}`;
    const response = await axios.get(url);
    return generateResponse(200, response.data);
  } catch (error) {
    console.error('Error fetching city data from OpenWeatherMap:', error.message);
    return generateResponse(500, { error: 'Failed to fetch city data.' });
  }
};
