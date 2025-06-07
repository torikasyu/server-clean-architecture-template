import express from 'express';
import * as request from 'supertest'
import { getWeatherController } from '../../../modules/weather/controllers/getWeatherController';
import { getWeatherUsecase } from '../../../modules/weather/applications/getWeatherUsecase';
import { getWeatherFromAPI } from '../../../modules/weather/infra/getWeatherFromAPI';
import { setupWeatherControllers } from '../../../modules/weather/controllers';
import TestAgent from 'supertest/lib/agent';
import http from 'http';
import { setupApplication } from '../../..';

describe('getWeatherController', () => {

    let app: express.Application;
    let server: http.Server;
    let agent: TestAgent;

    beforeAll(async () => {
        const port = 24000
        app = await setupApplication();
        server = app.listen(port)
        agent = new TestAgent(server);
    });

    afterAll(() => {
        server.close();
    });

    it('GET /api/weather - 正常な天気データ取得', async () => {
        const response = await agent
            .get('/api/weather/Tokyo')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('location', 'Tokyo');
        expect(response.body).toHaveProperty('temperature');
        expect(response.body).toHaveProperty('description');
    });
});
