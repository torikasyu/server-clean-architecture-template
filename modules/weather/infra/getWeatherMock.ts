import { Effect } from "effect";
import { WeatherRepositoryError } from "../domain/entities/error";
import { GetWeatherFunc } from "../domain/repositories";
import { Weather } from "../domain/entities/Weather";

export const getWeatherMock: GetWeatherFunc = (location) =>
  Effect.gen(function* () {

    if (!location || location.trim() === '') {
      yield* Effect.fail(new WeatherRepositoryError("Location cannot be empty"));
    }

    // Simulate delay operation
    yield* Effect.sleep("100 millis");

    const weather: Weather = {
      id: '1',
      location: location,
      temperature: 25,
      description: 'Sunny',
    }

    // Return mock weather data
    return weather
  });