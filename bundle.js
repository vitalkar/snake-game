(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
//snake directions
const DIRECTIONS = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};
//game object types
const TYPES = {
    SNAKE: 1,
    APPLE: 2,
    OBSTACLE: 3,
    FIELD: 4
};
//game object colors
const COLORS = {
    SNAKE: '#2337B9',
    APPLE: '#890C0C',
    OBSTACLE: '#737674',
    FIELD1: '#26A200',
    FIELD2: '#7baa61'
};

module.exports = {
    DIRECTIONS,
    TYPES,
    COLORS
};

},{}],2:[function(require,module,exports){
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


},{"./models/Game":5}],3:[function(require,module,exports){
'use strict';

const GameObject = require('./GameObject');
const { COLORS, TYPES } = require('../constants/constants');

/**
 * represents apple game object
 */
class Apple extends GameObject {

    constructor(c, l) { //todo change coords to location
        super(c, TYPES.APPLE);
        this._location = l;
    }
    //
    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = COLORS.APPLE;
        this.ctx.arc(this.location.x, this.location.y, 10, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }
}

module.exports = Apple;
},{"../constants/constants":1,"./GameObject":6}],4:[function(require,module,exports){
'use strict';
const GameObject = require('./GameObject');
const { COLORS, TYPES } = require('../constants/constants');
/**
 * represents field game object
 */
class Field extends GameObject{

    constructor(c) {
        super(c, TYPES.FIELD);       
    }
    
    draw() {
        // const background = this.ctx.createRadialGradient(this.width / 2, this.height / 2, 100 , 50, 50, 500);
        // background.addColorStop(0, COLORS.FIELD1)
        // background.addColorStop(1, COLORS.FIELD2);
        // this.ctx.fillStyle = background; 
        this.ctx.fillStyle = COLORS.FIELD1; 
        this.ctx.clearRect(this.location.x, this.location.y, this.width, this.height);
        this.ctx.fillRect(this.location.x, this.location.y, this.width, this.height);
    }
}
module.exports = Field;
},{"../constants/constants":1,"./GameObject":6}],5:[function(require,module,exports){
'use strict';
const Field = require('./Field');
const Snake = require('./Snake');
const Apple = require('./Apple');
const Obstacle = require('./Obstacle');
const Point = require('./Point');
const { DIRECTIONS } = require('../constants/constants');
const OFFSET = 20;
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

},{"../constants/constants":1,"./Apple":3,"./Field":4,"./Obstacle":7,"./Point":8,"./Snake":9}],6:[function(require,module,exports){
'use strict';
const Point = require('./Point');
const { TYPES } = require('../constants/constants');
/**
 * represents an abstract game object
 */
class GameObject {
    constructor(c, t) {
        this.ctx = c; //drawing ref
        //determine and create proper game object type
        switch (t) {
            case TYPES.SNAKE:
                this.width = 20;
                this.height = 20;
                this._location = new Point(350, 350); //
                break;
            case TYPES.APPLE:
                this.width = 20;
                this.height = 20;
                break;
            case TYPES.OBSTACLE:
            //todo
                this.width = Math.floor(Math.random() * 50 + 10);
                this.height = Math.floor(Math.random() * 50 + 10);
                break;
            case TYPES.FIELD:
            //todo
                this.width = 700;
                this.height = 700;
                this._location = new Point(0, 0);
                break;
        }
    }
    //getters & setters
    get location() {
        return this._location;
    }

    set location(v) {
        this._loaction.x = v.x;
        this._loaction.y = v.y;
    }
}
module.exports = GameObject;
},{"../constants/constants":1,"./Point":8}],7:[function(require,module,exports){
'use strict';
const GameObject = require('./GameObject');
const { COLORS, TYPES } = require('../constants/constants');
/**
 * represents an obstacle object 
 */
class Obstacle extends GameObject {
    constructor(c, l) {
        super(c, TYPES.OBSTACLE);
        this._location = l;
    }

    draw() {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = COLORS.OBSTACLE;
        this.ctx.fillStyle = COLORS.OBSTACLE;
        this.ctx.fillRect(this.location.x, this.location.y, this.width, this.height);
    }
}
module.exports = Obstacle;
},{"../constants/constants":1,"./GameObject":6}],8:[function(require,module,exports){
'use strict';
/**
 * represents a point on the field
 */
class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    //getters & setters
    get x() {
        return this._x;
    }
    
    set x(v) {
        this._x = v;
    }

    get y() {
        return this._y;
    }

    set y(v) {
        this._y = v;
    }
}
module.exports = Point;
},{}],9:[function(require,module,exports){
'use strict';
const GameObject = require('./GameObject');
const Point = require('./Point');
const {COLORS, DIRECTIONS, TYPES} = require('../constants/constants');
/**
 * represents the snake object
 */
class Snake extends GameObject {

    constructor(c) {
        super(c, TYPES.SNAKE);
        //trail of points that constructs the snake
        //initial position 
        this.trail = [new Point(this.location.x, this.location.y)];
        //snake speed
        this.speed = 20;
        //inial direction
        this.direction = { x: 0, y: 0 };
    }
    //inc snake 
    inc() {
        //todo        
        const loc = this.trail[this.trail.length - 1];
        // console.log(loc);

        //
        this.trail.push(new Point(loc.x, loc.y));
    }
    //
    draw() {
        //
        const { x, y } = this.direction;
        this.location.x += x;
        this.location.y += y;
        //enqueue new location, dequeue old location 
        this.trail.unshift(new Point(this.location.x, this.location.y));
        this.trail.pop();
        //
        // this.ctx.fillStyle = '#000';
        // this.trail.forEach(p => this.ctx.strokeRect(p.x, p.y, this.width, this.height));
        this.trail.forEach(p => {
            // this.ctx.strokeRect(p.x, p.y, this.width, this.height);
            this.ctx.beginPath();
            this.ctx.fillStyle = COLORS.SNAKE;
            this.ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
        });
    }

    //todo must i use 2 switch mechanisems?
    //set current direction of the snake
    setDirection(direction) {

        switch (direction) {
            case DIRECTIONS.LEFT:
                this.direction = { x: -(this.speed), y: 0 };
                break;
            case DIRECTIONS.UP:
                this.direction = { x: 0, y: -(this.speed) };
                break;
            case DIRECTIONS.RIGHT:
                this.direction = { x: this.speed, y: 0 };
                break;
            case DIRECTIONS.DOWN:
                this.direction = { x: 0, y: this.speed };
                break;
        }
    }
}

module.exports = Snake;
},{"../constants/constants":1,"./GameObject":6,"./Point":8}]},{},[2]);
