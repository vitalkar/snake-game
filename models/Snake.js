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