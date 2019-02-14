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