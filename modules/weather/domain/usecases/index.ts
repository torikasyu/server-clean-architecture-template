import { WeatherRepositoryError } from "../entities/error";
import { Weather } from "../entities/Weather";
import { GetWeatherFunc } from "../repositories";
import { Effect } from "effect";

export type GetWeatherUsecase = (getWeatherFunc: GetWeatherFunc) => 
    (location: string) => Effect.Effect<Weather, WeatherRepositoryError>;