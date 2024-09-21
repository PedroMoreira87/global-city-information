import axios from 'axios';

export const handler = async (event) => {
  try {
    const parsedBody = event.body ? JSON.parse(event.body) : {};
    const { selectedCityLat, selectedCityLon } = parsedBody;
    if (selectedCityLat === undefined || selectedCityLon === undefined) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'selectedCityLat and selectedCityLon are required' }),
      };
    }
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured');
    }
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${selectedCityLat}&lon=${selectedCityLon}&units=metric&appid=${apiKey}`;
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
