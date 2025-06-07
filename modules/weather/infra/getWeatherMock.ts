import { Weather } from "../domain/entities/Weather";
import { GetWeatherFunc } from "../domain/repositories/WeatherRepository";

export const getWeatherMock: GetWeatherFunc = async (location) => {
  try {
    const weather: Weather = {
      id: '1',
      location: location,
      temperature: 25,
      description: 'Sunny',
    }
    return weather || null;
  } catch (error) {
    console.error('Error fetching weather data from mock:', error);
    return null;
  }
};
