// tests/db.test.js

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(30000);

test("mongoose connects", async () => {
    const mongo = await MongoMemoryServer.create();

    await mongoose.connect(mongo.getUri());

    expect(mongoose.connection.readyState).toBe(1);

    await mongoose.disconnect();
    await mongo.stop();
});