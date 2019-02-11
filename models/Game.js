'use strict';
const Field = require('./Field');
const Snake = require('./Snake');
const Apple = require('./Apple');
const Obstacle = require('./Obstacle');
const Point = require('./Point');
const { DIRECTIONS } = require('../constants/constants');
const OFFSET = 10;
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
        this.score = 0;
        //number of obstacles generated in one time
        this.numOfObstacles = 5;
        this.field = null;
        this.snake = null;
        this.apple = null;
        this.obstacles = [];
        this.prevMove = '';
        //set game motion controls
        this.setMotionController();
    }
    //returns canvas ref
    getCanvas() {
        return this.canvas;
    }
    //determine & update game state
    render() {
        //determine game state
        if (this.isEat()) {
            //generate new location for the apple
            let duplicate = true;
            while (duplicate) {
                // x = this.generateRandom(this.field.width - this.apple.width);
                // y = this.generateRandom(this.field.height - this.apple.height);
                // loc = new Point(this.generateRandom(this.field.width - this.apple.width),
                // this.generateRandom(this.field.height - this.apple.height));
                this.apple.location.x = this.generateRandom(this.width - OFFSET);
                
                this.apple.location.y = this.generateRandom(this.height - OFFSET);
                console.log(this.apple.location.x, this.apple.location.y);
                duplicate = this.obstacles.some(obs => this.isOverlap(obs, this.apple));
            }
        }
        if (this.isCrash()) {
            //
            clearInterval(this.interval);
            // const crashEvent = new CustomEvent('crash');
            document.dispatchEvent(new CustomEvent('crash'));
        } else {
            //
            this.field.draw();
            //draw other objects
            if (this.obstacles.length > 0) {
                this.obstacles.forEach(obs => obs.draw());
            }
            this.apple.draw();
            this.snake.draw();
        }
    }
    //generates random number in range of 0 - n
    generateRandom(n) {
        return Math.floor(Math.random() * n) + OFFSET;
    }
    //check for collision between the snake and athe apple
    //todo is overlapping ?
    isEat() {
        //if snake eats the apple
        const s = this.snake.location,
            a = this.apple.location,
            size = Math.floor(this.apple.width / 2);

        if (

            (s.x + this.snake.width) >= a.x
            && (s.y + this.snake.height) >= a.y
            && s.x <= (a.x + this.apple.width)
            && s.y <= (a.y + this.apple.height)
            // (s.x + this.snake.width) >= a.x - size
            // && (s.y + this.snake.height) >= a.y - size
            // && s.x <= (a.x + size) 
            // && s.y <= (a.y + size)

        ) {
            //

            this.score++;
            const event = new CustomEvent('updateScore', {detail: this.score});
            document.dispatchEvent(event);
            console.log('Score: ', this.score);
            this.snake.inc();
            return true;
        }
        return false;
    }

    //checks if objects are overlapping
    isOverlap(a, b) {
        return ((a.location.x + a.width) >= b.location.x
            && (a.location.y + a.height) >= b.location.y
            && a.location.x <= (b.location.x + b.width)
            && a.location.y <= (b.location.y + b.height));
    }

    //determines a crash 
    isCrash() {
        const s = this.snake.location;

        //determines a 'crash' with field's boundries
        if (s.x < 15 || s.y < 15 ||
            s.x + this.snake.width > this.width ||
            s.y + this.snake.height > this.height) {
            return true;
        } else if (this.obstacles.length > 0) { //if there are obstacles in the field
            //determines a collision with an obstacle
            return this.obstacles.some(obs => this.isOverlap(this.snake, obs));
        } else if (this.snake.trail.length > 4) {//determine a collision of the snake with itself
            return this.snake.trail.slice(1).some(point => point.x === this.snake.location.x && point.y === this.snake.location.y);
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
        this.apple = new Apple(this.ctx, new Point(this.generateRandom(this.width - OFFSET), this.generateRandom(this.height - OFFSET)));
        this.obstacles = [];
        this.interval = setInterval(() => {
            this.render();
        }, 100);
    }

    //adds obstacles in random locations on the field
    addObstacles() {
        //generate obstacles
        for (let i = 0; i < this.numOfObstacles; i++) {

            //generate number
            let loc = null;
            let duplicate = true;
            while (duplicate) {
                //
                loc = new Point(this.generateRandom(this.width), this.generateRandom(this.height));
                //check for duplicates
                duplicate = this.obstacles.some(obs => obs.location.x === loc.x && obs.location.y === loc.y);
            }
            this.obstacles.push(new Obstacle(this.ctx, loc)); //todo use copy constructor for loc
        }
    }
    //
    updateScore() {
        //todo send ajax or event
    }
    //validates the snake move
    isValidMove(currMove) {

        if (currMove === this.prevMove) {
            return false;
        } else {
            //  
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
    setMotionController() {
        document.addEventListener('keydown', e => {
            const move = e.keyCode;
            if (this.isValidMove(move)) {
                this.prevMove = move;
                this.snake.setDirection(move);
            }
        });
    }

}//EOC

module.exports = Game;
