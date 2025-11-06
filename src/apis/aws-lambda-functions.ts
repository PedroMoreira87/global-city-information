import { fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios';

import { IWeather } from '../interfaces/user.interface';

// Create axios instance with base config
const apiClient = axios.create();

// // Add request interceptor to include auth token
// apiClient.interceptors.request.use(
//   async (config) => {
//     try {
//       const { tokens } = await fetchAuthSession();
//       if (tokens?.idToken) {
//         config.headers.Authorization = `Bearer ${tokens.idToken.toString()}`;
//       }
//     } catch (error) {
//       console.log(error, 'No authenticated user found');
//       // Optional: redirect to login or handle unauthenticated state
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { tokens } = await fetchAuthSession();
      console.log('Auth session tokens:', tokens); // Debug log

      if (tokens?.idToken) {
        const token = tokens.idToken.toString();
        console.log('Adding Authorization header with token'); // Debug log
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('No idToken found in session'); // Debug log
      }
    } catch (error) {
      console.log('Error fetching auth session:', error); // Debug log
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

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
  const response = await apiClient.get(`https://yzl2gp4vz5.execute-api.us-east-1.amazonaws.com/dev/users/${userId}`);
  return response.data;
};
