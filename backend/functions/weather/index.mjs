import axios from 'axios';

// Reusable CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': 'https://d2u17pmw1fxael.cloudfront.net/',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

// Helper function to create responses
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

// Validate request body
const validateRequestBody = (body) => {
  const { selectedCityLat, selectedCityLon } = body;
  if (selectedCityLat === undefined || selectedCityLon === undefined) {
    throw new Error('selectedCityLat and selectedCityLon are required.');
  }
  return { selectedCityLat, selectedCityLon };
};

export const handler = async (event) => {
  try {
    // Parse and validate request body
    const parsedBody = event.body ? JSON.parse(event.body) : {};
    const { selectedCityLat, selectedCityLon } = validateRequestBody(parsedBody);
    // Ensure API key is configured
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    if (!apiKey) {
      console.error('OpenWeatherMap API key is not configured.');
      return createResponse(500, { error: 'Server configuration error.' });
    }
    // Construct API URL
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${selectedCityLat}&lon=${selectedCityLon}&units=metric&appid=${apiKey}`;
    // Fetch data from OpenWeatherMap API
    const response = await axios.get(url);
    // Return successful response
    return createResponse(200, response.data);
  } catch (error) {
    // Handle validation errors
    if (error.message.includes('required')) {
      console.error('Validation error:', error.message);
      return createResponse(400, { error: error.message });
    }
    // Handle API errors or other issues
    console.error('Error fetching city data from OpenWeatherMap:', error.message);
    return createResponse(500, { error: 'Failed to fetch city data.' });
  }
};
