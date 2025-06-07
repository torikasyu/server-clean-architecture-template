import { Effect } from "effect";
import { Weather } from "../entities/Weather";
import { WeatherRepositoryError } from "../entities/error";

// Type for Effect-based weather functions
export type GetWeatherFunc = (location: string) => Effect.Effect<Weather, WeatherRepositoryError>;