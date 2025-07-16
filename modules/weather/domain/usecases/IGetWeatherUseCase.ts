import { WeatherRepositoryError } from "../entities/error";
import { Weather } from "../entities/Weather";
import { Effect } from "effect";

export type IGetWeatherUsecase = (req: GetWeatherRequest) => Effect.Effect<Weather, WeatherRepositoryError>;

export type GetWeatherRequest = {
    location: string;
}

export type GetWeatherResponse = {
    weather: Weather;
}