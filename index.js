// index.js 
const express = require('express');
require('dotenv').config();

// we have to remove before hosting
const dns = require('node:dns');
if(process.env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');

const PORT = process.env.PORT || 3000;

// connect to MongoDB
connectDB();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello from NoteVault!');
});

// routers
app.use('/auth', require('./routes/authRoutes'));
app.use('/notes', require('./routes/notesRoutes'));

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on PORT ${PORT}..`));
});