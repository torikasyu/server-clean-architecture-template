import { GetWeatherFunc } from "../domain/repositories";
import { GetWeatherUsecase } from "../domain/usecases";

type Dependency = {
    getWeatherFunc: GetWeatherFunc
}

export const getWeatherUsecase = ({ getWeatherFunc }: Dependency): GetWeatherUsecase =>
    (location: string) => {
        return getWeatherFunc(location);
    }
