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