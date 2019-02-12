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
