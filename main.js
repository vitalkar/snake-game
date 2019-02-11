'use strict';
//todo fix sizing issues : snake & obs
//todo 'play again' modal, after crash event
    const Game = require('./models/Game');
    const game = new Game();
    const score = document.getElementById('score');
    const btnObstacles = document.getElementById('btnObstacles');
    // const btnStart = document.getElementById('btnStart');
    const container = document.getElementById('container');
    //append canvas 
    container.appendChild(game.getCanvas());
    //set obstacles generator
    btnObstacles.addEventListener('click', () => {
        game.addObstacles();
    });
    //set score update handler
    document.addEventListener('updateScore', (e) => {
        score.innerText = `Score: ${e.detail}`;
    });
    //set end of game handler
    document.addEventListener('crash', (e) => {
        if (confirm('play again?')) {
            game.init();
            score.innerText = 'Score: 0';
        }
    });
    //initiate game
    game.init();

