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