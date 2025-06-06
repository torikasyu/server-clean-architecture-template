import { Weather } from '../object/Weather';

export type GetWeatherFunc = (location: string) => Promise<Weather | null>
