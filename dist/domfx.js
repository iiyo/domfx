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
    
    if (typeof duration === "function") {
        then = duration;
        duration = defaults.duration;
    }
    else if (typeof duration !== "number") {
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

},{"./defaults.js":1,"./utils.js":5}],3:[function(require,module,exports){

var fade = require("./fade");
var slide = require("./slide");

window.DOMFX = {
    fade: fade,
    slide: slide
};

},{"./fade":2,"./slide":4}],4:[function(require,module,exports){

var defaults = require("./defaults.js");
var utils = require("./utils.js");

var ATTRIBUTE = "data-old-style";

var RELEVANT_STYLES = [
    "height",
    "margin-top",
    "margin-bottom",
    "padding-top",
    "padding-bottom",
    "overflow",
    "display"
];

function extractRelevantStyles (styles) {
    
    var relevant = {};
    
    Object.keys(styles).forEach(function (key) {
        
        if (RELEVANT_STYLES.indexOf(key) < 0) {
            return;
        }
        
        relevant[key] = styles[key];
    });
    
    return relevant;
}

function preserveOldStyles (element) {
    
    var old = {};
    var styles = {};
    var computed = window.getComputedStyle(element);
    
    RELEVANT_STYLES.forEach(function (style) {
        styles[style] = computed[style];
        old[style] = element.style[style];
    });
    
    element.setAttribute(ATTRIBUTE, JSON.stringify({
        old: old,
        computed: styles
    }));
    
    applyRelevantStyles(element, computed);
}

function getOldStyles (element) {
    
    var value = element.getAttribute(ATTRIBUTE);
    
    if (!value) {
        
        value = {
            old: {},
            computed: {}
        };
        
        if (element.style.display === "none") {
            element.style.display = "";
            value.computed = extractRelevantStyles(window.getComputedStyle(element));
            element.style.display = "none";
        }
        
        return value;
    }
    
    return JSON.parse(value);
}

function applyRelevantStyles(element, style) {
    RELEVANT_STYLES.forEach(function (name) {
        element.style[name] = style[name];
    });
}

function slide (element, start, end, duration, then) {
    
    function update (v) {
        element.style.height = v + "px";
    }
    
    utils.tween(start, end, update, duration, then);
}

function slideEffect (type, element, duration, then) {
    
    var start = type === "in" ? 0 : utils.getHeight(element);
    var oldStyles = getOldStyles(element);
    var end = type === "in" ? parseInt(oldStyles.computed.height, 10) : 0;
    
    if (type === "out") {
        preserveOldStyles(element);
    }
    
    if (arguments.length < 2) {
        duration = defaults.duration;
    }
    
    if (arguments.length < 3 && typeof duration === "function") {
        then = duration;
        duration = defaults.duration;
    }
    
    duration = utils.ensureIsPositive(duration);
    
    element.style.overflow = "hidden";
    
    if (type === "in") {
        element.style.display = "";
    }
    
    return slide(element, start, end, duration, after);
    
    function after () {
        
        if (type === "out") {
            element.style.display = "none";
        }
        else {
            applyRelevantStyles(element, oldStyles.old);
        }
        
        if (typeof then === "function") {
            then();
        }
    }
}

function hasHeight (element) {
    return window.getComputedStyle(element).height !== "0px";
}

function slideIn (element, duration, then) {
    
    if (hasHeight(element)) {
        return utils.getThenArgument.apply(this, arguments)();
    }
    
    return slideEffect("in", element, duration, then);
}

function slideOut (element, duration, then) {
    
    if (!hasHeight(element)) {
        return utils.getThenArgument.apply(this, arguments)();
    }
    
    return slideEffect("out", element, duration, then);
}

function toggle (element, duration, then) {
    return (
        isVisible(element) ?
        slideOut(element, duration, then) :
        slideIn(element, duration, then)
    );
}

function isVisible (element) {
    return !utils.isHidden(element) && !utils.isOpacityZero(element) && utils.hasHeight(element);
}

module.exports = {
    in: slideIn,
    out: slideOut,
    toggle: toggle
};

},{"./defaults.js":1,"./utils.js":5}],5:[function(require,module,exports){

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
    
    var height;
    
//
// If an element is hidden, it needs to be made visible temporarily to calculate its real height.
//
    if (element.style.display === "none") {
        element.style.display = "";
        height = window.getComputedStyle(element).height;
        element.style.display = "none";
    }
    else {
        height = window.getComputedStyle(element).height;
    }
    
    return parseInt(height, 10);
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

function getThenArgument () {
    return (
        Array.prototype.find.call(arguments, function (arg) {
            return typeof arg === "function";
        }) ||
        function () {}
    );
}

module.exports = {
    getHeight: getHeight,
    getOpacity: getOpacity,
    getThenArgument: getThenArgument,
    ensureIsPositive: ensureIsPositive,
    isHidden: isHidden,
    isOpacityZero: isOpacityZero,
    hasHeight: hasHeight,
    transform: transform,
    tween: tween
};

},{}]},{},[3]);
