(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = {
    duration: 400
};

},{}],2:[function(require,module,exports){

var defaults = require("./defaults.js");
var utils = require("./utils.js");

function fade (element, start, end, duration, then) {
    
    function update (v) {
        element.style.opacity = v;
    }
    
    utils.tween(start, end, update, duration, then);
}

function isVisible (element) {
    
    if (utils.isHidden(element)) {
        return false;
    }
    
    return !utils.isOpacityZero(element);
}

function fadeEffect (type, element, duration, then) {
    
    var start = utils.getOpacity(element);
    var end = type === "in" ? 1 : 0;
    
    if (arguments.length < 2) {
        duration = defaults.duration;
    }
    
    if (arguments.length < 3 && typeof duration === "function") {
        then = duration;
        duration = defaults.duration;
    }
    
    duration = utils.ensureIsPositive(duration);
    
    return fade(element, start, end, duration, after);
    
    function after () {
        
        if (type === "out") {
            element.style.display = "none";
        }
        
        if (typeof then === "function") {
            then();
        }
    }
}

function fadeIn (element, duration, then) {
    
    if (element.style.display === "none") {
        element.style.opacity = "0";
        element.style.display = "";
    }
    
    return fadeEffect("in", element, duration, then);
}

function fadeOut (element, duration, then) {
    return fadeEffect("out", element, duration, then);
}

function toggle (element, duration, then) {
    return (
        isVisible(element) ?
        fadeOut(element, duration, then) :
        fadeIn(element, duration, then)
    );
}

module.exports = {
    in: fadeIn,
    out: fadeOut,
    toggle: toggle
};

},{"./defaults.js":1,"./utils.js":4}],3:[function(require,module,exports){

var fade = require("./fade");

window.DOMFX = {
    fade: fade
};

},{"./fade":2}],4:[function(require,module,exports){

var DEFAULT_DURATION = 400;

//
// If `requestAnimationFrame` is not available, we simulate it with a 60
// frames per second timeout.
//
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (fn) {
        setTimeout(fn, 1000 / 60);
    };
}

//
// ## Function `transform`
//
// A function that takes another function and feeds it values from `0` to `1`
// over a specified duration. This is the most basic function everything
// else here is built upon. To do something useful, the supplied callback
// function usually has to do some basic math to calculate the *real* start
// and end values of a transformation.
//
// Please note that no **easing** is used here at all, so everything is just linear.
// The supplied function is responsible for applying any easing if it is needed.
//
function transform (fn, duration, then) {
    
    var tStart = Date.now();
    var end = 1;
    
//
// The parameters `duration` and `then` are both optional.
//
    duration = typeof duration === "number" ? duration : DEFAULT_DURATION;
    then = typeof duration === "function" ? duration : then;
    then = typeof then === "function" ? then : function () {};
    
    function loop () {
        
        var tCurrent = Date.now() - tStart;
        var value = end * ((tCurrent / (duration / 100)) / 100);
        
        value = value > end ? end : value;
        
        if (tCurrent > duration || value === end) {
            fn(end);
            then();
            return;
        }
        
        fn(value);
        
        requestAnimationFrame(loop);
    }
    
    loop();
}

function tween (start, end, fn, duration, then) {
    
    var diff = Math.abs(start - end);
    
    function down (v) {
        fn(end + diff * (1 - v));
    }
    
    function up (v) {
        fn(start + diff * v);
    }
    
    return transform(start < end ? up : down, duration, then);
}

function getHeight (element) {
    return element.offsetHeight;
}

function hasHeight (element) {
    return getHeight(element) > 0;
}

function getOpacity (element) {
    return (element.style.opacity === "" ? 1 : parseInt(element.style.opacity, 10));
}

function ensureIsPositive (v) {
    return (v < 0 ? 0 : v);
}

function isHidden (element) {
    return element.style.display === "none";
}

function isOpacityZero (element) {
    return !(element.style.opacity === "" || element.style.opacity > 0);
}

module.exports = {
    getHeight: getHeight,
    getOpacity: getOpacity,
    ensureIsPositive: ensureIsPositive,
    isHidden: isHidden,
    isOpacityZero: isOpacityZero,
    hasHeight: hasHeight,
    transform: transform,
    tween: tween
};

},{}]},{},[3]);
