'use strict';
//todo score
//todo use PAGE Lifecycle
//todo typescript
//todo fix sizing issues : snake & obs

const DIRECTIONS = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};
//field object types
const TYPES = {
    SNAKE: 1,
    APPLE: 2,
    OBSTACLE: 3
};

const COLORS = {
    SNAKE: '#2337B9',
    APPLE: '#890C0C',
    OBSTACLE: '#737674',
    FIELD: '#26A200'
};
/**
 * 
 */
class Field {
    // canvas = null;
    // ctx = null;

    constructor(w, h) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.border = '1px solid black';
        this.ctx = this.canvas.getContext('2d');
        this.width = w; //todo ?
        this.height = h;
        document.body.appendChild(this.canvas); //todo make it in game class        
    }

    //clears the field
    draw() {
        this.ctx.fillStyle = COLORS.FIELD;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

/**
 * abstract class 
 */
class FieldObject {
    
    constructor(c, t, l = null) {
        this.ctx = c; //drawing ref
        this._location = l;
        //determine field object type
        switch (t) {
            case TYPES.SNAKE:
                this.width = 20;
                this.height = 20;
                this._location = new Point(350, 350); //
                break;
            case TYPES.APPLE:
                this.width = 20;
                this.height = 20;
                this._location = new Point(500, 350); //todod genrate random position
                break;
            case TYPES.OBSTACLE:
                this.width = Math.floor(Math.random() * 50 + 10);
                this.height = Math.floor(Math.random() * 50 + 10);
                // this.height = 20;
                // this._location = new Point(0, 0); //
                break;
        }
    }
    //
    draw() {
        console.log('this is draw');
    }
    //
    get location() {
        return this._location;
    }

    set location(v) {
        this._loaction.x = v.x;
        this._loaction.y = v.y;
    }
}

/**
 * represents an apple object
 */
class Apple extends FieldObject {

    constructor(c) { //todo change coords to location
        super(c, TYPES.APPLE);
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
/**
 * represents an obstacle object 
 */
class Obstacle extends FieldObject {
    constructor(c, l) {
        super(c, TYPES.OBSTACLE);
        this._location = l;
    }

    draw() {
        this.ctx.fillStyle = COLORS.OBSTACLE;
        this.ctx.fillRect(this.location.x, this.location.y, this.width, this.height);
    }
}

/**
 * represents the snake object
 */
class Snake extends FieldObject{

    constructor(c) {
        super(c, TYPES.SNAKE);
        //trail of points that constructs the snake
        //initial position 
        this.trail = [ new Point(this.location.x, this.location.y) ];
        //snake speed
        this.speed = 20;
        //inial direction
        this.direction = {x: 0, y: 0};
        //initial draw
        // this.ctx.fillRect(this.location.x, this.location.y, this.width, this.height); // place at center   
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
        const {x, y} = this.direction;
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
                this.direction = {x: -(this.speed), y: 0};
                break;
            case DIRECTIONS.UP:    
                this.direction = {x: 0, y: -(this.speed)};
                break;
            case DIRECTIONS.RIGHT:
                this.direction = {x: this.speed, y: 0};
                break;
            case DIRECTIONS.DOWN:
                this.direction = {x: 0, y: this.speed};
                break;
        }
    }
}

/**
 * 
 */
class Game {

    constructor() {
        this.score = 0;
        this.numOfObstacles = 5;
        this.field = null; //todo move to init
        this.snake = null;
        this.apple = null;
        this.obstacles = null;
        this.prevMove = '';
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
                    const size = this.apple.width / 2;
                    console.log(size);
                    
                    this.apple.location.x = this.generateRandom(this.field.width - size);
                    this.apple.location.y = this.generateRandom(this.field.height - size);
                    
                    duplicate = this.obstacles.some(obs => this.isOverlap(obs, this.apple));
                }

         

                // this.apple.location = new Point(this.generateRandom(this.field.width - size, this.generateRandom(this.field.height - size)));
            
        }
        
        if (this.isCrash()) {
            //
            clearInterval(this.interval);
            console.log('crash!');
            //todo propmpt end of game
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
        return Math.floor(Math.random() * n);
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
        console.log(s);
        
        //determines a 'crash' with field's boundries
        if (s.x < 15 || s.y < 15 || 
            s.x + this.snake.width > this.field.canvas.width ||
            s.y + this.snake.height > this.field.canvas.height ) {
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

    //
    init() {
        //
        this.field = new Field(700, 700);
        //
        this.snake = new Snake(this.field.ctx);
        //generate initial location
        this.apple = new Apple(this.field.ctx);
        //
        this.obstacles = [];
        //
        this.setMotionController();
        //
        this.interval = setInterval(() => {
            this.render();
        }, 100);
    }

    //adds obstacles in random locations
    addObstacles() {
        console.log(this.obstacles);
        
        //generate obstacles
        for (let i = 0; i < this.numOfObstacles; i++) {
            
            //generate number
            let loc = null;            
            let duplicate = true;
            while (duplicate) {
                //
                loc = new Point(this.generateRandom(this.field.width), this.generateRandom(this.field.height));
                //check for duplicates
                duplicate = this.obstacles.some(obs => obs.location.x === loc.x && obs.location.y === loc.y );
            }
            this.obstacles.push(new Obstacle(this.field.ctx, loc)); //todo use copy constructor for loc
        }        
    }
    //
    updateScore() {
        //todo send ajax or event
    }
    //validates the snake move
    isValidMove(currMove) {

        if(currMove === this.prevMove) {
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
}//EOC

/**
 * game initiation
 */
(() => {
    console.log('on load');
    
    const game = new Game();

    const score = document.getElementById('score');
    const btnObstacles = document.getElementById('btnObstacles');
    const btnStart = document.getElementById('btnStart');
    console.log(btnObstacles);
    

    btnObstacles.addEventListener('click', () => {
        console.log('add obstacles');
        game.addObstacles();
    });
    btnStart.addEventListener('click', () => {
        game.init();
    });
    //todo set score
})();
//todo read page lifecycle events
// todo only one current game instance
// const startGame = (() => { 
//     new Game().init()
// })();
