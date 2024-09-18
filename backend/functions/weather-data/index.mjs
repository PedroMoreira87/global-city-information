import axios from 'axios';

export const handler = async (event) => {
  try {
    const { selectedCityLat, selectedCityLon } = event.body;
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured');
    }
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${selectedCityLat}&lon=${selectedCityLon}&units=metric&appid=${apiKey}`;
    const response = await axios.get(url);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: response.data,
    };
  } catch (error) {
    console.error('Error fetching city data from OpenWeatherMap:', error.message);
    return {
      statusCode: 500,
      body: { error: 'Failed to fetch city data' },
    };
  }
};
