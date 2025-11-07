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

    // Simplify headers setting
    config.headers = new axios.AxiosHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    // Add detailed logging
    const tokenFirstPart = token.split('.')[0] || '';
    console.log('🔐 Request details:', {
      endpoint: config.url,
      method: config.method,
      tokenHeader: `Bearer ${tokenFirstPart}...`,
      headers: config.headers,
    });

    return config;
  } catch (error) {
    console.error('🚨 Auth interceptor error:', error);
    throw error; // Don't return Promise.reject(error)
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

export const getUser = async (userId: string) => {
  try {
    const { tokens } = await fetchAuthSession();

    // Validate token
    if (!tokens?.idToken) {
      throw new Error('No authentication token available');
    }

    // Log full request details
    console.log('📝 User request details:', {
      userId,
      hasToken: !!tokens.idToken,
      tokenExpiry: new Date((tokens.idToken.payload.exp || 0) * 1000).toISOString(),
    });

    const response = await apiClient.get(`https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/users/${userId}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Request failed:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};
