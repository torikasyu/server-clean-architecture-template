import { Weather } from "../entities/Weather";

export type GetWeatherFunc = (location: string) => Promise<Weather | null>
