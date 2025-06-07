import { describe, expect, it } from '@jest/globals';
import { Effect, Either } from 'effect';
import { getWeatherMock } from './getWeatherMock';
import { WeatherRepositoryError } from '../domain/entities/error';

describe('getWeatherMock', () => {

  it('天気が取得できる', async () => {
    const result = await Effect.runPromise(
      Effect.either(getWeatherMock('Tokyo'))
    );

    if (Either.isLeft(result)) {
      throw result.left;
    }

    expect(result.right).toEqual({
      id: '1',
      location: 'Tokyo',
      temperature: 25,
      description: 'Sunny',
    });
  });

  it('場所が空白の場合はエラーを返す', async () => {
    const result = await Effect.runPromise(
      Effect.either(getWeatherMock(''))
    );

    if (Either.isRight(result)) {
      throw new Error('エラーが発生しなかった');
    }

    expect(result.left).toBeInstanceOf(WeatherRepositoryError);
    expect(result.left.message).toBe('Location cannot be empty');
  });

})