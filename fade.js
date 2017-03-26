
var defaults = require("./defaults.js");
var utils = require("./utils.js");

function fade (element, start, end, duration, then) {
    
    function update (v) {
        element.style.opacity = utils.easing.swing(v);
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
    
    var ownDisplay = element.style.display;
    
//
// If the element's own value for `display` is `none`, we have to remove
// this value; if after that the element is still set to `none` for its
// computed values, it means that `none` was set in CSS and we have to
// assume this is a block element. Setting `display` to `""` in this case
// wouldn't accomplish anything.
//
    if (ownDisplay === "none") {
        element.style.opacity = "0";
        element.style.display = "";
    }
    
    if (window.getComputedStyle(element).display === "none") {
        element.style.opacity = "0";
        element.style.display = "block";
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
