
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
