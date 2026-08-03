    // index.js 
    const app = require('./app');
    const mongoose = require('mongoose');
    const connectDB = require('./config/dbConn');

    const PORT = process.env.PORT || 3000;

    // we have to remove before hosting
    const dns = require('node:dns');
    if(process.env.NODE_ENV !== 'production') {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    }

    // connect to MongoDB
    connectDB();


    mongoose.connection.once('open', () => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on PORT ${PORT}..`));
    });