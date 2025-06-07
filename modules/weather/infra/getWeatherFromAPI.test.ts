import { Effect, Either } from "effect";
import { getWeatherFromAPI } from "./getWeatherFromAPI"
import { WeatherRepositoryError } from "../domain/entities/error";

jest.setTimeout(10000); // タイムアウトを10秒に設定

describe('getWeatherFromAPI', () => {
  it('should fetch weather data successfully', async () => {
    const result = await Effect.runPromise(
      Effect.either(getWeatherFromAPI('Tokyo'))
    );

    if (Either.isLeft(result)) {
      throw result.left;
    }

    expect(result.right).toEqual({
      id: expect.any(String),
      location: 'Tokyo',
      temperature: expect.any(Number),
      description: expect.any(String),
    });
  });

  it('should return an error if location is empty', async () => {
    const result = await Effect.runPromise(
      Effect.either(getWeatherFromAPI(''))
    );

    if (Either.isRight(result)) {
      throw new Error('エラーが発生しなかった');
    }

    expect(result.left).toBeInstanceOf(WeatherRepositoryError);
    expect(result.left.message).toBe('Location cannot be empty');
  });

  it('存在しない場所を指定するとエラーを返す', async () => {
    const result = await Effect.runPromise(
      Effect.either(getWeatherFromAPI('HogeHoge'))
    );
    if (Either.isRight(result)) {
      throw new Error('エラーが発生しなかった');
    }
    expect(result.left).toBeInstanceOf(WeatherRepositoryError);
    expect(result.left.message).toBe('HTTP error: 404');
  });
});