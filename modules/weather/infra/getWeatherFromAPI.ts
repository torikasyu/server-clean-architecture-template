import { GetWeatherFunc } from "../domain/repositories/WeatherRepository";

export const getWeatherFromAPI: GetWeatherFunc = async (location) => {
  try {
    const response = await fetch(`https://api.weather.com/v3/weather/${location}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data: unknown = await response.json();
    
    // Type guard to check if data has the expected shape
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }
    
    const weatherData = data as Record<string, unknown>;
    
    if (!weatherData.id || !weatherData.location || 
        typeof weatherData.temperature !== 'number' || 
        !weatherData.description) {
      throw new Error('Invalid data format');
    }
    
    return {
      id: String(weatherData.id),
      location: String(weatherData.location),
      temperature: weatherData.temperature as number,
      description: String(weatherData.description),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};
