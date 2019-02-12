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
    // FIELD1: '#26A200',
    FIELD1: '#16561c',
    FIELD2: '#7baa61'
};

module.exports = {
    DIRECTIONS,
    TYPES,
    COLORS
};
