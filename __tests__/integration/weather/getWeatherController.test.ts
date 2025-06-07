import express from 'express';
import request from 'supertest';
import { setupApplication } from '../../..';

describe('getWeatherController', () => {

    let app: express.Application;

    beforeAll(async () => {
        app = await setupApplication();
    });

    it('GET /api/weather - 正常な天気データ取得', async () => {
        const response = await request(app)
            .get('/api/weather/Tokyo')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('location', 'Tokyo');
        expect(response.body).toHaveProperty('temperature');
        expect(response.body).toHaveProperty('description');
    });

    it('GET /api/weather - 存在しない場所名でエラー', async () => {
        const response = await request(app)
            .get('/api/weather/HogeHoge')
            .expect(500)
            .expect('Content-Type', /json/);
        expect(response.body).toEqual({ error: "Failed to get weather" });
    });
});
