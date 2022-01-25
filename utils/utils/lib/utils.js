'use strict';


function utils() {
    // TODO
    console.log('i am utils')
}

function isObject (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}
module.exports = {
    utils,
    isObject
};