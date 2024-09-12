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
import toast from 'react-hot-toast';

import { geoLocation, weatherData } from '../../apis/open-weather-map.ts';
import { City } from '../../interfaces/city.interface.ts';
import { WeatherData } from '../../interfaces/weather.interface.ts';
import MapWithGeocoding from './MapWithGeocoding/MapWithGeocoding.tsx';
import './Weather.scss';

const Weather = () => {
  const [weather, setWeather] = useState<WeatherData | undefined>(undefined);
  const [city, setCity] = useState<City[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [placesFoundSelect, setPlacesFoundSelect] = useState<City | null>(null);
  const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleButtonSearch = async () => {
    try {
      const cityResponse = await geoLocation(cityInput);
      if (cityResponse.data.length > 0) {
        setCity(cityResponse.data);
        toast.success(`Cities found for "${cityInput}"!`);
      } else {
        toast.error(`No cities were found for "${cityInput}"!`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(`Failed to find cities: ${error.message}`);
      } else {
        console.error('Unexpected error', error);
      }
    }
  };

  const handleSelectChange = async (event: SelectChangeEvent) => {
    const selectedCity = JSON.parse(event.target.value) as City;
    setPlacesFoundSelect(selectedCity);
    setCityCoordinates({ lat: selectedCity.lat, lng: selectedCity.lon });
    try {
      const weatherResponse = await weatherData(selectedCity.lat, selectedCity.lon);
      setWeather(weatherResponse.data);
      toast.success(`Weather data loaded successfully for ${selectedCity.name}!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(`Failed to load weather data: ${error.message}`);
      } else {
        console.error('Unexpected error', error);
      }
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
      {city.length > 0 && (
        <div className="weather__places-found">
          <Box sx={{ width: 331.75 }}>
            <FormControl fullWidth>
              <InputLabel id="places-found-label">Places Found</InputLabel>
              <Select
                labelId="places-found-label"
                id="places-found"
                value={placesFoundSelect ? JSON.stringify(placesFoundSelect) : ''}
                label="Places Found"
                onChange={handleSelectChange}
                variant="outlined"
              >
                {city?.map((city, index) => (
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
            <span>Temperature: {weather?.current.temp}°C</span>
            <span>Feels Like: {weather?.current.feels_like}°C</span>
            <span>Condition: {weather?.current.weather[0].description}</span>
            <span>Humidity: {weather?.current.humidity}%</span>
          </div>
          <MapWithGeocoding cityCoordinates={cityCoordinates} />
        </>
      )}
    </div>
  );
};

export default Weather;
