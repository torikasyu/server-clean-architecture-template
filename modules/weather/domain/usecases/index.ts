import { WeatherRepositoryError } from "../entities/error";
import { Weather } from "../entities/Weather";
import { Effect } from "effect";

export type GetWeatherUsecase = (location: string) => Effect.Effect<Weather, WeatherRepositoryError>;