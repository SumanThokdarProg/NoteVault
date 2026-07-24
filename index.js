// index.js 
const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello from NoteVault!');
});

// routers
app.use('/auth', require('./routes/authRoutes'));

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}..`));