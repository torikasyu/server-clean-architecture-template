export class WeatherRepositoryError extends Error {
  readonly _tag = "RepositoryError";
  constructor(message: string) {
    super(message);
  }
};