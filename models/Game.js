'use strict';
const Field = require('./Field');
const Snake = require('./Snake');
const Apple = require('./Apple');
const Obstacle = require('./Obstacle');
const Point = require('./Point');
const { DIRECTIONS, OFFSET } = require('../constants/constants');
/**
 * represents the game & all of it's parts
 */
class Game {
    
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        //initiate game variables 
        this.canvas.width = 700;
        this.canvas.height = 700;
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
        this.SetEndOfGameListener();
    }
    //initiates a game
    init() {
        this.score = 0;
        this.prevMove = '';
        this.field = new Field(this.ctx, this.canvas.width, this.canvas.height);
        this.snake = new Snake(this.ctx, new Point(this.canvas.width / 2, this.canvas.height / 2));
        this.apple = new Apple(this.ctx, new Point(this.generateRandom(this.canvas.width - OFFSET.OVERLAP),
            this.generateRandom(this.canvas.height - OFFSET.OVERLAP)));
        this.obstacles = [];
        this.interval = setInterval(() => {
            this.render();
        }, 100);
    }
    //determine & update game state
    render() {
        //determine game state
        if (this.isEat()) {
            this.setNewAppleLocation();
        } 
        if (this.isCrash()) {
            //end of game
            clearInterval(this.interval);
            //dispatch end of game event
            this.NotifyEndOfGame();
        } else { //render game state
            this.field.draw();
            if (this.obstacles.length > 0) { //if there are obstacles
                this.obstacles.forEach(obs => obs.draw());
            }
            this.apple.draw();
            this.snake.draw();
        }
    }
    /**
     * GAME MODEL METHODS
     */
    //check if the snake and the apple overlaps
    isEat() {
        if (this.isOverlap(this.snake, this.apple)) {
            this.updateScore();
            this.snake.inc();
            return true;
        } else {
            return false;
        }
    }
    //sets a new location of the apple on the field
    setNewAppleLocation() {
        let duplicate = true;
        while (duplicate) {
            this.apple.location.x = this.generateRandom(this.canvas.width - OFFSET.OVERLAP);
            this.apple.location.y = this.generateRandom(this.canvas.height - OFFSET.OVERLAP);
            duplicate = this.obstacles.some(obs => this.isOverlap(this.apple, obs));
        }
    }
    //determines a crash of the snake with other game objects
    isCrash() {
        return (this.isBoundaryCrash() || this.isObsCrash() || this.isSelfCrash()) ? true : false ;
    }
    //determines a crash with field's boundries
    isBoundaryCrash() {
        const s = this.snake.location;
        return (s.x < OFFSET.BOUNDARY 
                || s.y < OFFSET.BOUNDARY 
                || s.x > this.canvas.width - OFFSET.BOUNDARY - 5 
                || s.y > this.canvas.height - OFFSET.BOUNDARY - 5) ;
    }
    //determines a crash with an obstacle            
    isObsCrash() {
        //if there are no obstacles
        if (this.obstacles.length === 0) {
            return false;
        } else {
            return this.obstacles.some(obs => this.isOverlap(this.snake, obs));
        }
    }
    //determines a crash of the snake with itself
    isSelfCrash() {
        //if the snake's trail is too short
        if (this.snake.trail.length < 5) {
            return false;
        } else {
            const s = this.snake.location;
            return this.snake.trail.slice(1).some(p => p.x === s.x && p.y === s.y);
        }
    }
    //checks if objects are overlapping
    isOverlap(obj1, obj2) {
        return ((obj1.location.x + obj1.width) >= obj2.location.x
            && (obj1.location.y + obj1.height) >= obj2.location.y
            && obj1.location.x <= (obj2.location.x + obj2.width)
            && obj1.location.y <= (obj2.location.y + obj2.height));
    }
    //adds obstacles in random locations on the field
    addObstacles() {
        //generate obstacles in random locations
        for (let i = 0; i < this.numOfObstacles; i++) {
            let obs = new Obstacle(this.ctx, new Point(this.generateRandom(this.canvas.width - OFFSET.OVERLAP), 
                                this.generateRandom(this.canvas.height - OFFSET.OVERLAP)));
            //if no overlap detected
            if (this.isOverlap(this.apple, obs) || this.isOverlap(this.snake, obs)) {
                i--;
            } else { //another iteration 
                this.obstacles.push(obs);           
            }  
        }
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
    //updates the score via custom event
    updateScore() {
        this.score++;
        document.dispatchEvent(new CustomEvent('updateScore', { detail: this.score }));
    }
    //notify end of game via custom event
    NotifyEndOfGame() {
        document.dispatchEvent(new CustomEvent('crash'));
    }
    //utility method
    //generates random number in range of (0 - n) + OFFSET
    generateRandom(n) {
        // return Math.floor(Math.random() * n) + SNAKE_OFFSET;
        return Math.floor(Math.random() * n);
    }
    /**
     * GAME CONTROL METHODS
     */
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
    //set end of game handler
    SetEndOfGameListener() {
        document.addEventListener('crash', (e) => {
            if (confirm('play again?')) {
                this.init();
                score.innerText = 'Score: 0';
            }
        });
    }
    //append the canvas to the view
    //sets event listeners
    configLayout(c, b, s) {
        //append canvas 
        c.appendChild(this.canvas);
        //set obstacles generator
        b.addEventListener('click', () => {
            this.addObstacles();
        });
        //set score update handler
        document.addEventListener('updateScore', (e) => {
            s.innerText = `Score: ${e.detail}`;
            s.innerText = `Score: ${this.score}`;
        });
    }
}
module.exports = Game;
