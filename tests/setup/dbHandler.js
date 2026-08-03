// tests/setup/dbHandler.js
// process.env.MONGOMS_DEBUG = '1';
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectTestDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        if (mongoose.connection.readyState === 2) {
            await mongoose.connection.asPromise();
            return;
        }

        mongoServer = await MongoMemoryServer.create();
        const uri = await mongoServer.getUri();
        await mongoose.connect(uri, { dbName: 'NoteVault' });
        await mongoose.connection.asPromise();

        // console.log('URI:', uri);
        // console.log('readyState:', mongoose.connection.readyState);
        // console.log('host:', mongoose.connection.host);
        // console.log('db:', mongoose.connection.name);
        console.log('Mongo connected');
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

const closeTestDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
        }
    } catch (err) {
        console.error(err.message);
    } finally {
        if (mongoServer) {
            try {
                await mongoServer.stop();
            } catch (err) {
                console.error(err.message);
            }
            mongoServer = null;
        }
    }
};

const clearTestDB = async () => {
    try {
        if (mongoose.connection.readyState !== 1) return;

        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    } catch (err) {
        console.error(err.message);
    }
};

module.exports = { 
    connectTestDB,
    closeTestDB,
    clearTestDB
}