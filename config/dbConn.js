// config/dbConn.js
const mongoose = require('mongoose');

const clintOptions = { serverApi: { version: '1', strict: true, deprecationError: true } };
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, clintOptions);

    } catch(err) {
        console.error(`MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;