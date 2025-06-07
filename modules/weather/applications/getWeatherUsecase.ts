import { GetWeatherUsecase } from "../domain/usecases";

export const getWeatherUsecase: GetWeatherUsecase = (getWeatherFunc) =>
    (location: string) => {
        return getWeatherFunc(location);
    }
