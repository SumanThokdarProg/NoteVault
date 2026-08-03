// tests/setup/testHelpers.js
const app = require('../../app');
const request = require('supertest');


const createAndLoginUser = async () => {
    const payload = { email: 'testing@gmail.com', password: 'testing123' };
    await request(app)
        .post('/auth/signup')
        .set('Content-Type', 'Application/json')
        .send(payload);

    const response =  await request(app)
        .post('/auth/login')
        .set('Content-Type', 'Application/json')
        .send(payload);

    return response.body.newAccessToken;
}

module.exports = createAndLoginUser;