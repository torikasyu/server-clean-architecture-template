import { GetWeatherUsecase } from "../domain/usecases/WeatherUsecase";

export const getWeatherUsecase: GetWeatherUsecase = (getWeatherFunc) =>
    (location: string) => {
        return getWeatherFunc(location);
    }
