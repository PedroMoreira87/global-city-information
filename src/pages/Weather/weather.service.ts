import { City } from '../../interfaces/city.interface.ts';

export const saveCity = (entry: City) => {
  localStorage.setItem('savedCity', JSON.stringify(entry));
};

export const getCity = (): City | null => {
  const storedCity = localStorage.getItem('savedCity');
  return storedCity ? JSON.parse(storedCity) : null;
};
