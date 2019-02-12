'use strict';
const Field = require('./Field');
const Snake = require('./Snake');
const Apple = require('./Apple');
const Obstacle = require('./Obstacle');
const Point = require('./Point');
const { DIRECTIONS } = require('../constants/constants');
const SNAKE_OFFSET = 10, BOUNDARY_OFFSET = 15, OVERLAP_OFFSET = 20;
/**
 * represents the game & all of it's parts
 */
class Game {

    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        //initiate game variables
        this.width = 700;
        this.height = 700;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // this.canvas.style.width = '100%';
        // this.canvas.style.height = '100%';
        // this.width = this.canvas.width;
        // this.height = this.canvas.height;
        this.score = 0;
        //number of obstacles generated in one time
        this.numOfObstacles = 5;
        this.field = null;
        this.snake = null;
        this.apple = null;
        this.obstacles = [];
        this.prevMove = '';
        //set game motion controls
        this.setMotionListener();
        this.SetUpdateScoreListener();
        this.SetEndOfGameListener();
        // this.configLayout();
    }
    //returns canvas ref
    getCanvas() {
        return this.canvas;
    }
    //determine & update game state
    render() {
        //determine game state
        if (this.isEat()) {
            //todo refactor
            //generate new location for the apple
            let duplicate = true;
            while (duplicate) {
                this.apple.location.x = this.generateRandom(this.width - this.apple.width);
                this.apple.location.y = this.generateRandom(this.height - this.apple.height);
                console.log(this.apple.location.x, this.apple.location.y);
                duplicate = this.obstacles.some(obs => this.OnsOverApple(obs));
            }
        }
        //check for crash
        if (this.isCrash()) {
            //end of game
            clearInterval(this.interval);
            //dispatch end of game event
            this.NotifyEndOfGame();
        } else { //render game state
            this.field.draw();
            if (this.obstacles.length > 0) {
                this.obstacles.forEach(obs => obs.draw());
            }
            this.apple.draw();
            this.snake.draw();
        }
    }
    //generates random number in range of (0 - n) + OFFSET
    generateRandom(n) {
        return Math.floor(Math.random() * n) + SNAKE_OFFSET;
    }
    //check if the snake and the apple overlaps
    isEat() {
        const s = this.snake.location,
            a = this.apple.location;
        if ((s.x + SNAKE_OFFSET) >= a.x
            && (s.y + SNAKE_OFFSET) >= a.y
            && s.x <= (a.x + SNAKE_OFFSET)
            && s.y <= (a.y + SNAKE_OFFSET)) {
                this.updateScore();
                this.snake.inc();
                return true;
        } else {
            return false;
        }
    }
    //todo 
    ObsOverApple(o) {
        const a = this.apple;
        return ((o.location.x + (o.width)) >= a.location.x
            && (o.location.y + (o.height)) >= a.location.y
            && o.location.x <= (a.location.x + (a.width))
            && o.location.y <= (a.location.y + (a.height)));
    }

    ObsOverSnake(o) {
        const s = this.snake;
        return ((s.location.x + 10) >= o.location.x
        && (s.location.y + 10) >= o.location.y
        && s.location.x <= (o.location.x + o.width)
        && s.location.y <= (o.location.y + o.height));
    }
    //checks if objects are overlapping
    isOverlap(){

    }

    //determines a crash of the snake with other game objects
    isCrash() {
        const s = this.snake.location;
        //determines a crash with field's boundries
        //todo
        if (s.x < BOUNDARY_OFFSET || s.y < BOUNDARY_OFFSET ||
            s.x + BOUNDARY_OFFSET > this.width ||
            s.y + BOUNDARY_OFFSET > this.height) {
            return true;
        } else if (this.snake.trail.length > 3) {//determine a collision of the snake with itself
            return this.snake.trail.slice(1).some(point => point.x === this.snake.location.x && point.y === this.snake.location.y);
        } else if (this.obstacles.length > 0) { //if there are obstacles in the field
            //determines a collision with an obstacle            
            return this.obstacles.some(obs => this.ObsOverSnake(obs));
        } else { //default
            return false;
        }
    }

    //initiates a game
    init() {
        this.score = 0;
        this.prevMove = '';
        this.field = new Field(this.ctx);
        this.snake = new Snake(this.ctx);
        //todo
        this.apple = new Apple(this.ctx, new Point(this.generateRandom(this.width - OVERLAP_OFFSET),
                                                     this.generateRandom(this.height - OVERLAP_OFFSET)));
        this.obstacles = [];
        this.interval = setInterval(() => {
            this.render();
        }, 100);
    }

    //adds obstacles in random locations on the field
    addObstacles() {
        //generate obstacles
        for (let i = 0; i < this.numOfObstacles; i++) {
            let loc = null;
            let duplicate = true;
            while (duplicate) {
                loc = new Point(this.generateRandom(this.width - OVERLAP_OFFSET), this.generateRandom(this.height - OVERLAP_OFFSET));
                //check for duplicates locations
                //todo
                duplicate = this.obstacles.some(obs => obs.location.x === loc.x 
                                                        && obs.location.y === loc.y 
                                                        && obs.location.x === this.snake.location.x
                                                        && obs.location.x === this.snake.location.x);
            }
            this.obstacles.push(new Obstacle(this.ctx, loc)); //todo use copy constructor for loc            
        }
    }
    //updates the score via custom event
    updateScore() {
        this.score++;
        document.dispatchEvent(new CustomEvent('updateScore', { detail: this.score }));
    }
    //notify end of game via custom event
    NotifyEndOfGame() {
        document.dispatchEvent(new CustomEvent('crash'));
    }
    //validates the snake move
    isValidMove(currMove) {
        //if same direction
        if (currMove === this.prevMove) {
            return false;
        } else { // if counter-direction, returns false - otherwise returns true
            switch (currMove) {
                case DIRECTIONS.LEFT:
                    return this.prevMove === DIRECTIONS.RIGHT ? false : true;
                case DIRECTIONS.RIGHT:
                    return this.prevMove === DIRECTIONS.LEFT ? false : true;
                case DIRECTIONS.UP:
                    return this.prevMove === DIRECTIONS.DOWN ? false : true;
                case DIRECTIONS.DOWN:
                    return this.prevMove === DIRECTIONS.UP ? false : true;
            }
        }
    }
    //snake motion handler
    setMotionListener() {
        document.addEventListener('keydown', e => {
            const move = e.keyCode;
            if (this.isValidMove(move)) {
                this.prevMove = move;
                this.snake.setDirection(move);
            }
        });
    }

    //set score update handler
    SetUpdateScoreListener() {
        document.addEventListener('updateScore', (e) => {
            score.innerText = `Score: ${e.detail}`;
        });
    }
    

    //set end of game handler
    SetEndOfGameListener() {
        document.addEventListener('crash', (e) => {
            if (confirm('play again?')) {
                game.init();
                score.innerText = 'Score: 0';
            }
        });
    }
    //
    configLayout(c, b) {
        //append canvas 
        c.appendChild(this.getCanvas());
        //set obstacles generator
        b.addEventListener('click', () => {
            this.addObstacles();
        });
    }
}
module.exports = Game;
