// tests/auth.test.js
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup/dbHandler');
const request = require('supertest');
const app = require('../app');
const mongoose = require("mongoose");

// jest.setTimeout(30000);

beforeAll(async () => await connectTestDB());
afterAll(async () => await closeTestDB() );

describe('validating the signup controller', () => {
    beforeEach(async () => await clearTestDB() ); 
    afterEach(async () => await clearTestDB() ); 

    const checkSignup = async (payload, statusCode) => {
        const response = await request(app)
            .post('/auth/signup')
            .set('Content-Type', 'application/json')
            .send(payload);

        expect(response.status).toBe(statusCode);
        // except(response.body.email).toBe(payload.email);
    }

    test('Successful signup with valid data → expect 201', async () => {
        const payload = { email: 'testing@gmail.com', password: 'testing123' };
        await checkSignup(payload, 201);
    });

    test('Signup with an already-existing email → expect 409', async () => {
        const payload = { email: 'testing@gmail.com', password: 'testing123' };
        await request(app)
            .post('/auth/signup')
            .set('Content-Type', 'application/json')
            .send(payload);
        await checkSignup(payload, 409);
    });

    test('Signup with invalid data (e.g., missing password, or password too short) → expect 400', async () => {
        const payload = { email: 'testing@gmail.com', password: '' };
        await checkSignup(payload, 400);
    });
    
});

describe('validating the logon controller', () => {
    beforeEach(async () => await clearTestDB() ); 
    afterEach(async () => await clearTestDB() ); 

    test('Login with correct credentials → 200, response has newAccessToken, and a jwt cookie is set', async () => {
        const payload = { email: 'testing@gmail.com', password: 'testing123' };
        await request(app)
            .post('/auth/signup')
            .set('Content-Type', 'Application/json')
            .send(payload);

        const response = await request(app)
            .post('/auth/login')
            .set('Content-Type', 'Application/json')
            .send(payload);

        const newAccessToken = response.body.newAccessToken;
        const cookie = response.headers['set-cookie'];
    
        expect(response.status).toBe(200);
        expect(newAccessToken).toBeDefined();
        expect(cookie).toBeDefined();
    });

    test('Login with wrong password → 401', async () => {
        const payload = { email: 'testing@gmail.com', password: 'testing123' };
        await request(app)
            .post('/auth/signup')
            .set('Content-Type', 'Application/json')
            .send(payload);
    
        payload.password = 'wrongPassword';
        const response = await request(app)
            .post('/auth/login')
            .set('Content-Type', 'Application/json')
            .send(payload);
    
        expect(response.status).toBe(401);
    });

    test('Login with non-existent email → 404', async () => {
        const payload = { email: 'testing@gmail.com', password: 'testing123' };
        await request(app)
            .post('/auth/signup')
            .set('Content-Type', 'Application/json')
            .send(payload);
    
        payload.email = 'absent@gmail.com';
        const response = await request(app)
            .post('/auth/login')
            .set('Content-Type', 'Application/json')
            .send(payload);
    
        expect(response.status).toBe(404);
    });
});
