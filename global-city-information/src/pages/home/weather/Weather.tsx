import { useAuthenticator } from '@aws-amplify/ui-react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { geolocation, getUser, updateUser, weatherData } from '../../../apis/aws-lambda-functions.ts';
import { City } from '../../../interfaces/city.interface.ts';
import { Place, IWeather, User } from '../../../interfaces/user.interface.ts';
import { WeatherAPI } from '../../../interfaces/weather-api.interface.ts';
import MapWithGeocoding from './mapWithGeocoding/MapWithGeocoding.tsx';
import './Weather.scss';

interface WeatherProps {
  onUserDataUpdate: (updatedUserData: User) => void;
}

const Weather: React.FC<WeatherProps> = ({ onUserDataUpdate }) => {
  const { user } = useAuthenticator();
  const [weatherAPI, setWeatherAPI] = useState<WeatherAPI | undefined>(undefined);
  const [cityAPI, setCityAPI] = useState<City[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [placesFoundSelect, setPlacesFoundSelect] = useState<City | null>(null);
  const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleButtonSearch = async () => {
    try {
      const cityResponse = await geolocation(cityInput);
      if (cityResponse.length > 0) {
        setCityAPI(cityResponse);
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
      setWeatherAPI(weatherResponse);
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

  const handleSaveButton = async () => {
    const place: Place = {
      city: placesFoundSelect!.name,
      state: placesFoundSelect!.state,
      country: placesFoundSelect!.country,
    };
    const userWeather: IWeather = {
      place: place,
      temperature: weatherAPI!.current.temp,
      feelsLike: weatherAPI!.current.feels_like,
      description: weatherAPI!.current.weather[0].description,
      humidity: weatherAPI!.current.humidity,
      latitude: weatherAPI!.lat,
      longitude: weatherAPI!.lon,
    };
    try {
      await updateUser(user.userId, userWeather);
      const userData = await getUser(user.userId);
      onUserDataUpdate(userData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(`Failed to update user data: ${error.message}`);
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
      {cityAPI.length > 0 && (
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
                {cityAPI?.map((city, index) => (
                  <MenuItem key={index} value={JSON.stringify(city)}>
                    {city.name}, {city.state}, {city.country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {weatherAPI && (
            <Button variant="contained" onClick={handleSaveButton}>
              Save Data
            </Button>
          )}
        </div>
      )}
      {placesFoundSelect && (
        <>
          <div className="weather__data">
            <span>
              Weather in {placesFoundSelect.name}, {placesFoundSelect.state}, {placesFoundSelect.country}
            </span>
            <span>Temperature: {weatherAPI?.current.temp}°C</span>
            <span>Feels Like: {weatherAPI?.current.feels_like}°C</span>
            <span>Condition: {weatherAPI?.current.weather[0].description}</span>
            <span>Humidity: {weatherAPI?.current.humidity}%</span>
          </div>
          <MapWithGeocoding cityCoordinates={cityCoordinates} />
        </>
      )}
    </div>
  );
};

export default Weather;
