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