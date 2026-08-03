// app.js 
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
    if (req.body == null) req.body = {};
    next();
});

app.get('/', (req, res) => {
    res.send('Hello from NoteVault!');
});

// routers
app.use('/auth', require('./routes/authRoutes'));
app.use('/notes', require('./routes/notesRoutes'));
app.use('/users', require('./routes/userRoutes'));

module.exports = app;