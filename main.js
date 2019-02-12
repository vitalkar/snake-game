'use strict';
    const Game = require('./models/Game');
    const game = new Game();
    const score = document.getElementById('score');
    const btnObstacles = document.getElementById('btnObstacles');
    const container = document.getElementById('container');

    game.configLayout(container, btnObstacles);
    //initiate game
    game.init();

