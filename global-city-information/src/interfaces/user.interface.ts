export interface UserWeather {
  place: Place;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  latitude: number;
  longitude: number;
}

export interface Place {
  city: string;
  state: string;
  country: string;
}
