import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import './Weather.scss';
import toast from 'react-hot-toast';
import { saveCity } from './weather.service.ts';
import { City } from '../../interfaces/city.interface.ts';
import { WeatherData } from '../../interfaces/weather.interface.ts';
import MapWithGeocoding from '../MapWithGeocoding/MapWithGeocoding.tsx';

const OpenWeatherMapAPIKey = import.meta.env.VITE_OPENWEATHERMAPAPIKEY;

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | undefined>(undefined);
  const [cityData, setCityData] = useState<City[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [placesFoundSelect, setPlacesFoundSelect] = useState<City | null>(null);
  const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleButtonSearch = async () => {
    try {
      const cityResponse = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${OpenWeatherMapAPIKey}`,
      );
      setCityData(cityResponse.data);
      toast.success(`Cities found for "${cityInput}"!`);
    } catch (error: any) {
      console.log(error);
      toast.error(`Failed to find cities: ${error.message}`);
    }
  };

  const handleSelectChange = async (event: SelectChangeEvent) => {
    const selectedCity = JSON.parse(event.target.value) as City;
    setPlacesFoundSelect(selectedCity);
    setCityCoordinates({ lat: selectedCity.lat, lng: selectedCity.lon });
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${OpenWeatherMapAPIKey}`,
      );
      setWeatherData(weatherResponse.data);
      saveCity(selectedCity as unknown as City);
      toast.success(`Weather data loaded successfully for ${selectedCity.name}!`);
    } catch (error: any) {
      console.log(error);
      toast.error(`Failed to load weather data: ${error.message}`);
    }
  };

  return (
    <div className="weather">
      <div className="weather__inputs">
        <TextField
          id="city"
          label="City"
          variant="outlined"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <Button variant="contained" onClick={handleButtonSearch}>
          Search
        </Button>
      </div>
      {cityData.length > 0 && (
        <div className="weather__places-found">
          <Box sx={{ width: 320 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Places Found</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={placesFoundSelect ? JSON.stringify(placesFoundSelect) : ''}
                label="Places Found"
                onChange={handleSelectChange}
                variant="outlined"
              >
                {cityData?.map((city, index) => (
                  <MenuItem key={index} value={JSON.stringify(city)}>
                    {city.name}, {city.state}, {city.country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </div>
      )}
      {placesFoundSelect && (
        <>
          <div className="weather__data">
            <span>
              Weather in {placesFoundSelect.name}, {placesFoundSelect.state},{' '}
              {placesFoundSelect.country}
            </span>
            <span>Temperature: {weatherData?.current.temp}°C</span>
            <span>Feels Like: {weatherData?.current.feels_like}°C</span>
            <span>Condition: {weatherData?.current.weather[0].description}</span>
            <span>Humidity: {weatherData?.current.humidity}%</span>
          </div>
          <MapWithGeocoding cityCoordinates={cityCoordinates} />
        </>
      )}
    </div>
  );
};

export default Weather;
