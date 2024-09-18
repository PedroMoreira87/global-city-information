import axios from 'axios';

export const geoLocation = async (cityInput: string) => {
  const response = await axios.post(
    'https://kdkeo0gqnd.execute-api.us-east-1.amazonaws.com/dev/geo-location',
    {  body: { cityInput } },
  );
  return response.data.body;
};

export const weatherData = async (selectedCityLat: number, selectedCityLon: number) => {
  const response = await axios.post(
    'https://kdkeo0gqnd.execute-api.us-east-1.amazonaws.com/dev/weather-data',
    {  body: { selectedCityLat, selectedCityLon } },
  );
  return response.data.body;
};
