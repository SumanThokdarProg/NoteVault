const { connectTestDB, clearTestDB, closeTestDB } = require('./setup/dbHandler');
const createAndLoginUser = require('./setup/testHelpers');
const request = require('supertest');
const app = require('../app');

beforeAll(async () => await connectTestDB());
afterAll(async () => await closeTestDB());

describe('the test cases for POST /notes and GET /notes', () => {
    beforeEach(async () => await clearTestDB() ); 
    afterEach(async () => await clearTestDB() ); 

    test('Creating a note with a valid token → 201, response has the note with correct title/content', async () => {
        const accessToken = await createAndLoginUser();

        const payload = { title: 'Death Note', content: 'Write anyone name here' };
        const response = await request(app)
            .post('/notes')
            .auth(accessToken, { type: 'bearer' })       // Alternative to .set()
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.title).toBe(payload.title);
    });

    test('Creating a note without a token → 401 (proves authMiddleware is actually protecting the route)', async () => {
        const accessToken = await createAndLoginUser();

        const payload = { title: 'Death Note', content: 'Write anyone name here' };
        const response = await request(app)
            .post('/notes')
            // .set('Authorization', '')           // `Bearer ${accessToken}`
            .send(payload);

        expect(response.status).toBe(401);
    });

    test('Getting all notes for a user who has created some → returns an array with the right notes', async () => {
        const accessToken = await createAndLoginUser();

        const payload1 = { title: 'Death Note', content: 'Write anyone name here' };
        await request(app)
            .post('/notes')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(payload1);
            
        const payload2 = { title: 'Self Note', content: 'Write anyone name here' };
        await request(app)
            .post('/notes')
            .auth(accessToken, { type: 'bearer' })
            .send(payload2);
        
        const response = await request(app)
            .get('/notes')
            .auth(accessToken, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        const titles = response.body.map(note => note.title);
        expect(titles).toContain(payload1.title);
        expect(titles).toContain(payload2.title);
    });

    test('Getting all notes for a user with none → returns []', async () => {
        const accessToken = await createAndLoginUser();

        const response = await request(app)
            .get('/notes')
            .auth(accessToken, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    // 
    const shuffleStringQuick = str => str.split('').sort(() => Math.random() - 0.5).join('');        // Shuffle the string 

    test(`GET /notes/:id — valid own note, someone else's note (should 404), invalid id format (400)`, async () => {
        const accessToken = await createAndLoginUser();

        const payload = { title: 'Death Note', content: 'Write anyone name here' };
        const newNote = await request(app)
            .post('/notes')
            .auth(accessToken, { type: 'bearer' })      
            .send(payload);  
            
        const noteId = newNote.body._id;
        const validNote = await request(app)
            .get(`/notes/${noteId}`)
            .auth(accessToken, { type: 'bearer' });
            
        const invalidIdFormat = await request(app)
            .get(`/notes/12345678`)
            .auth(accessToken, { type: 'bearer' });
            
        const someoneElseNote = await request(app)
            .get(`/notes/${shuffleStringQuick(noteId)}`)
            .auth(accessToken, { type: 'bearer' });   
            
        expect(validNote.status).toBe(200);
        expect(invalidIdFormat.status).toBe(400);
        expect(someoneElseNote.status).toBe(404);
    });

    test(`PUT /notes/:id — valid update, if the note id doesn't match any document, you get 404`, async () => {
        const accessToken = await createAndLoginUser();

        const payload = { title: 'Death Note', content: 'Write anyone name here' };
        const newNote = await request(app)
            .post('/notes')
            .auth(accessToken, { type: 'bearer' })      
            .send(payload);

        const noteId = newNote.body._id;

        payload.title = 'Self Note';
        const updateNote = await request(app)
            .put(`/notes/${noteId}`)
            .auth(accessToken, { type: 'bearer' })
            .send(payload);

        const someoneElseNote = await request(app)
            .put(`/notes/${shuffleStringQuick(noteId)}`)
            .auth(accessToken, { type: 'bearer' })
            .send(payload);

        expect(updateNote.status).toBe(200);
        expect(someoneElseNote.status).toBe(404);
    });

    test(`DELETE /notes/:id — valid delete, deleting a nonexistent/already-deleted note`, async () => {
        const accessToken = await createAndLoginUser();

        const payload = { title: 'Death Note', content: 'Write anyone name here' };
        const newNote = await request(app)
            .post('/notes')
            .auth(accessToken, { type: 'bearer' })      
            .send(payload);

        const noteId = newNote.body._id;

        const deleteNote = await request(app)
            .delete(`/notes/${noteId}`)
            .auth(accessToken, { type: 'bearer' });

        const alreadyDeleteNote = await request(app)
            .delete(`/notes/${noteId}`)
            .auth(accessToken, { type: 'bearer' });
            
        expect(deleteNote.status).toBe(200);
        expect(alreadyDeleteNote.status).toBe(404);
    });
});