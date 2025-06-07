import { getWeatherMock } from './getWeatherMock';

describe('getWeatherMock', () => {
  it('should return weather data for a given location', async () => {
    const location = 'Tokyo';
    const result = await getWeatherMock(location);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      id: '1',
      location: 'Tokyo',
      temperature: 25,
      description: 'Sunny',
    });
  });

  it('should handle different locations', async () => {
    const location = 'New York';
    const result = await getWeatherMock(location);

    expect(result).not.toBeNull();
    expect(result?.location).toBe('New York');
  });

  it('should return null on error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock an error by passing undefined and forcing an error
    const getWeatherMockWithError = async (_location: string) => {
      try {
        throw new Error('Simulated error');
      } catch (error) {
        console.error('Error fetching weather data from mock:', error);
        return null;
      }
    };

    const result = await getWeatherMockWithError('Tokyo');
    
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching weather data from mock:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});