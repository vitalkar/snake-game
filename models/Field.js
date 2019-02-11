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