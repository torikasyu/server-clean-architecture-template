export class WeatherRepositoryError extends Error {
  readonly _tag = "RepositoryError";
  constructor(message: string) {
    super(message);
  }
};

export class WeatherValidationError extends Error {
  readonly _tag = "WeatherValidationError";
  constructor(message: string) {
    super(message);
  }
}