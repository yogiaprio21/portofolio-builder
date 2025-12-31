const express = require('express');
const cors = require('cors');
const path = require('path');

const portfoliosRoute = require('./routes/portfolios');
const uploadRoute = require('./routes/upload');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads')));

app.use('/portfolios', portfoliosRoute);
app.use('/upload', uploadRoute);

module.exports = app;
