import axios from 'axios';

export const handler = async (event) => {
  try {
    const parsedBody = event.body ? JSON.parse(event.body) : {};
    const { cityInput } = parsedBody;
    if (!cityInput) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'cityInput is required' }),
      };
    }
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured');
    }
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${apiKey}`;
    const response = await axios.get(url);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching city data from OpenWeatherMap:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch city data' }),
    };
  }
};
