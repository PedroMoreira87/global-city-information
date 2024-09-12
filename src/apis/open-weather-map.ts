import axios from 'axios';

const OpenWeatherMapAPIKey = import.meta.env.VITE_OPENWEATHERMAPAPIKEY;

export const geoLocation = async (cityInput: string) => {
  return await axios.get(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${OpenWeatherMapAPIKey}`,
  );
};

export const weatherData = async (selectedCityLat: number, selectedCityLon: number) => {
  return await axios.get(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${selectedCityLat}&lon=${selectedCityLon}&units=metric&appid=${OpenWeatherMapAPIKey}`,
  );
};
