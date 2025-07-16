import { GetWeatherFunc } from "../domain/repositories";
import { IGetWeatherUsecase, GetWeatherRequest } from "../domain/usecases/IGetWeatherUseCase";

type Dependency = {
    getWeatherFunc: GetWeatherFunc;
}

export const getWeatherUsecase = ({ getWeatherFunc }: Dependency): IGetWeatherUsecase =>
    (req: GetWeatherRequest) => {
        return getWeatherFunc(req.location);
    }
