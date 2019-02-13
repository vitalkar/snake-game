'use strict';
const express = require('express');
const app = express();


// console.log(__dirname + '/index.html');


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

app.listen(3000);