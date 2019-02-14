'use strict';
const express = require('express');
const app = express();
//
const PORT = process.env.PORT || 8000;
//middleware
app.use(express.static('public'));
app.listen(PORT, () => console.log(`listening on port ${PORT}`));