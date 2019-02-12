'use strict';
    const Game = require('./models/Game');
    const game = new Game();
    const score = document.getElementById('score');
    const btnObstacles = document.getElementById('btnObstacles');
    const container = document.getElementById('container');
    //attach elements to proper handlers
    game.configLayout(container, btnObstacles, score);
    //initiate game
    game.init();

