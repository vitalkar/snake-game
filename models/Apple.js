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