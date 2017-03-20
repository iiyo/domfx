
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
