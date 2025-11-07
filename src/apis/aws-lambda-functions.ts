import { fetchAuthSession } from 'aws-amplify/auth';
import axios, { AxiosRequestHeaders } from 'axios';

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

    // Assign headers without replacing AxiosHeaders instance
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
      config.headers.set('Content-Type', 'application/json');
      config.headers.set('Accept', 'application/json');
    } else {
      if (config.headers && typeof (config.headers as AxiosRequestHeaders).set === 'function') {
        (config.headers as AxiosRequestHeaders).set('Authorization', `Bearer ${token}`);
        (config.headers as AxiosRequestHeaders).set('Content-Type', 'application/json');
        (config.headers as AxiosRequestHeaders).set('Accept', 'application/json');
      } else {
        if (config.headers && typeof (config.headers as AxiosRequestHeaders).set === 'function') {
          (config.headers as AxiosRequestHeaders).set('Authorization', `Bearer ${token}`);
          (config.headers as AxiosRequestHeaders).set('Content-Type', 'application/json');
          (config.headers as AxiosRequestHeaders).set('Accept', 'application/json');
        } else {
          config.headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          } as AxiosRequestHeaders;
        }
      }
    }

    // Debug logging
    console.log('🔑 Token validation:', {
      tokenExists: !!token,
      tokenLength: token.length,
      firstChars: token.substring(0, 20) + '...',
      headers: {
        Authorization: 'Bearer [REDACTED]',
        ContentType: config.headers['Content-Type'],
      },
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

// Update getUser function with better error handling
export const getUser = async (userId: string) => {
  try {
    // Verify auth session explicitly before making the call
    const { tokens } = await fetchAuthSession();
    if (!tokens?.idToken) {
      throw new Error('No authentication token available');
    }

    console.log('🔍 Making request for user:', userId);

    const response = await apiClient.get(`https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/users/${userId}`, {
      validateStatus: (status) => {
        console.log('📡 Response status:', status);
        return status >= 200 && status < 300;
      },
    });

    console.log('✅ Request successful');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Get user error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  }
};
