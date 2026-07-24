// index.js 
const express = require('express');
require()
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello from NoteVault!');
});

app.use('/auth', require('./routes/authRoutes'));

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}..`));