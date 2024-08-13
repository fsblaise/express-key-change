const express = require('express');
const app = express();

const navRoute = require('./nav_test');

app.use('/navtest', navRoute);

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});