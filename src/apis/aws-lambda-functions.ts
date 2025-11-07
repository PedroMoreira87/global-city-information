import { fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios';

import { IWeather } from '../interfaces/user.interface';

// Create axios instance with base config
const apiClient = axios.create();

// Add request interceptor to include auth token
apiClient.interceptors.request.use(async (config) => {
  try {
    const { tokens } = await fetchAuthSession();

    if (!tokens?.idToken) {
      throw new Error('No ID token available');
    }

    const token = tokens.idToken.toString();

    // Ensure headers object exists
    config.headers = config.headers || {};

    // Set only required headers
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
    // Remove any cache-control headers as they're causing CORS issues
    delete config.headers['Cache-Control'];

    // Log headers for debugging
    console.log('🔐 Request headers:', {
      Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'missing',
      ContentType: config.headers['Content-Type'],
    });

    return config;
  } catch (error) {
    console.error('🚨 Auth interceptor error:', error);
    return Promise.reject(error);
  }
});

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Just log the 401 error without redirecting
      console.log('Authentication error - 401 Unauthorized');
      console.log('Error details:', error.response?.data);
    } else {
      // Log other errors
      console.log('API Error:', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  },
);

export const geolocation = async (cityInput: string) => {
  const response = await apiClient.post('https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/geolocations', {
    cityInput,
  });
  return response.data;
};

export const weatherData = async (selectedCityLat: number, selectedCityLon: number) => {
  const response = await apiClient.post('https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/weather', {
    selectedCityLat,
    selectedCityLon,
  });
  return response.data;
};

export const updateUser = async (userId: string, userWeather: IWeather) => {
  const response = await apiClient.put(
    `https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/users/${userId}`,
    userWeather,
  );
  return response.data;
};

// Update the getUser function to remove cache-control header
export const getUser = async (userId: string) => {
  try {
    const { tokens } = await fetchAuthSession();
    if (!tokens?.idToken) {
      throw new Error('No authentication token available');
    }

    const response = await apiClient.get(`https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/users/${userId}`);
    return response.data;
  } catch (error: Error | unknown) {
    if (axios.isAxiosError(error)) {
      console.error('🚨 Get user error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    } else {
      console.error('🚨 Get user error:', error);
    }
    throw error;
  }
};
