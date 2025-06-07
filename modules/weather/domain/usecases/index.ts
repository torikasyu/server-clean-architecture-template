import { Weather } from "../entities/Weather";
import { GetWeatherFunc } from "../repositories";

export type GetWeatherUsecase = (getWeatherFunc: GetWeatherFunc) => 
    (location: string) => Promise<Weather | null>;