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
    SNAKE: '#7670a5',
    APPLE: '#890C0C',
    OBSTACLE: '#737674',
    FIELD: '#16561c',
};

const OFFSET = {
    OVERLAP: 20,
    BOUNDARY: 10
}

module.exports = {
    DIRECTIONS,
    TYPES,
    COLORS,
    OFFSET
};

},{}],2:[function(require,module,exports){
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
    
    draw() {
        this.ctx.shadowBlur = 7;
        this.ctx.shadowColor = COLORS.APPLE;
        this.ctx.fillStyle = COLORS.APPLE;
        this.ctx.fillRect(this.location.x, this.location.y, this.width, this.height);
        this.ctx.shadowBlur = 0;
    }
}
module.exports = Apple;
},{"../constants/constants":1,"./GameObject":5}],3:[function(require,module,exports){
'use strict';
const GameObject = require('./GameObject');
const { COLORS, TYPES } = require('../constants/constants');
/**
 * represents field game object
 */
class Field extends GameObject{

    constructor(c, w, h) {
        super(c, TYPES.FIELD);
        this.width = w;
        this.height = h;       
    }
    
    draw() {
        this.ctx.fillStyle = COLORS.FIELD; 
        this.ctx.clearRect(this.location.x, this.location.y, this.width, this.height);
        this.ctx.fillRect(this.location.x, this.location.y, this.width, this.height);
    }
}
module.exports = Field;
},{"../constants/constants":1,"./GameObject":5}],4:[function(require,module,exports){
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
    //generates random number in range of (0 - n) + OFFSET
    generateRandom(n) {
        // return Math.floor(Math.random() * n) + SNAKE_OFFSET;
        return Math.floor(Math.random() * n);
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
    //set end of game handler
    SetEndOfGameListener() {
        document.addEventListener('crash', (e) => {
            if (confirm('play again?')) {
                this.init();
                score.innerText = 'Score: 0';
            }
        });
    }
    //append the canvas to view
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

},{"../constants/constants":1,"./Apple":2,"./Field":3,"./Obstacle":6,"./Point":7,"./Snake":8}],5:[function(require,module,exports){
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
                this.width = 22;
                this.height = 22;
                break;
            case TYPES.APPLE:
                this.width = 20;
                this.height = 20;
                break;
            case TYPES.OBSTACLE:
                this.width = Math.floor(Math.random() * 50 + 10);
                this.height = Math.floor(Math.random() * 50 + 10);
                break;
            case TYPES.FIELD:
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
},{"../constants/constants":1,"./Point":7}],6:[function(require,module,exports){
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
        this.ctx.fillStyle = COLORS.OBSTACLE;
        this.ctx.fillRect(this.location.x, this.location.y, this.width, this.height);
    }
}
module.exports = Obstacle;
},{"../constants/constants":1,"./GameObject":5}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
'use strict';
const GameObject = require('./GameObject');
const Point = require('./Point');
const {COLORS, DIRECTIONS, TYPES} = require('../constants/constants');
/**
 * represents the snake object
 */
class Snake extends GameObject {

    constructor(c, l) {
        super(c, TYPES.SNAKE);
        //initial position 
        this._location = l;
        //trail of points that constructs the snake
        this.trail = [new Point(this.location.x, this.location.y)];
        //snake's speed
        this.speed = 20;
        //inial direction
        this.direction = { x: 0, y: 0 };
    }
    //increase snake trail
    inc() {      
        const loc = this.trail[this.trail.length - 1];
        this.trail.push(new Point(loc.x, loc.y));
    }

    draw() {
        const { x, y } = this.direction;
        //change current location
        this.location.x += x; 
        this.location.y += y;
        //enqueue 
        this.trail.unshift(new Point(this.location.x, this.location.y));
        //dequeue
        this.trail.pop();
        //draw 
        this.ctx.shadowBlur = 7;
        this.ctx.shadowColor = COLORS.SNAKE;
        this.ctx.fillStyle = COLORS.SNAKE;
        this.trail.forEach(p => this.ctx.fillRect(p.x, p.y, this.width, this.height));
        this.ctx.shadowBlur = 0;
    }
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
},{"../constants/constants":1,"./GameObject":5,"./Point":7}],9:[function(require,module,exports){
'use strict';
    const Game = require('./Game');
    const game = new Game();
    const score = document.getElementById('score');
    const btnObstacles = document.getElementById('btnObstacles');
    const container = document.getElementById('container');
    //attach elements to proper handlers
    game.configLayout(container, btnObstacles, score);
    //initiate game
    game.init();


},{"./Game":4}]},{},[9]);
