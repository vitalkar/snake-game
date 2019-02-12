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