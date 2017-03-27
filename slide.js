
var defaults = require("./defaults.js");
var utils = require("./utils.js");

var OLD_STYLE_ATTRIBUTE = "data-old-style";
var BLOCKING_ATTRIBUTE = "data-block-toggle-effect";
var BLOCKED_VALUE = "blocked";

var RELEVANT_STYLES = [
    "height",
    "marginTop",
    "marginBottom",
    "paddingTop",
    "paddingBottom",
    "overflow",
    "display"
];

function extractRelevantStyles (styles) {
    
    var relevant = {};
    
    RELEVANT_STYLES.forEach(function (property) {
        if (property in styles) {
            relevant[property] = styles[property];
        }
    });
    
    return relevant;
}

function preserveOldStyles (element) {
    
    var old = {};
    var styles = {};
    var computed = window.getComputedStyle(element);
    
    RELEVANT_STYLES.forEach(function (style) {
        
        styles[style] = computed[style];
        
        if (style in element.style) {
            old[style] = element.style[style];
        }
    });
    
    element.setAttribute(OLD_STYLE_ATTRIBUTE, JSON.stringify({
        old: old,
        computed: styles
    }));
    
    applyRelevantStyles(element, computed);
}

function getOldStyles (element) {
    
    var value = element.getAttribute(OLD_STYLE_ATTRIBUTE);
    
    if (!value) {
        
        value = {
            old: {},
            computed: {}
        };
        
        if (window.getComputedStyle(element).display === "none") {
            element.style.display = "block";
            value.computed = extractRelevantStyles(window.getComputedStyle(element));
            element.style.display = "none";
        }
        else {
            value.computed = extractRelevantStyles(window.getComputedStyle(element));
        }
        
        return value;
    }
    
    return JSON.parse(value);
}

function applyRelevantStyles(element, style) {
    RELEVANT_STYLES.forEach(function (name) {
        
        if (name in style) {
            element.style[name] = style[name];
        }
        
    });
}

function slide (element, values, duration, then) {
    
    function update (v) {
        
        v = utils.easing.swing(v);
        
        element.style.height = (v * values.height) + "px";
        element.style.paddingTop = (v * values.paddingTop) + "px";
        element.style.paddingBottom = (v * values.paddingTop) + "px";
        element.style.marginTop = (v * values.marginTop) + "px";
        element.style.marginBottom = (v * values.marginTop) + "px";
    }
    
    utils.tween(values.start, values.end, update, duration, then);
}

function slideEffect (type, element, duration, then) {
    
    var start, end, oldStyles;
    
    if (arguments.length < 3) {
        duration = defaults.duration;
    }
    
    if (arguments.length < 4 && typeof duration === "function") {
        then = duration;
        duration = defaults.duration;
    }
    
    if (element.getAttribute(BLOCKING_ATTRIBUTE) === BLOCKED_VALUE) {
        return (then ? then() : undefined);
    }
    
    element.setAttribute(BLOCKING_ATTRIBUTE, BLOCKED_VALUE);
    
    start = type === "in" ? 0 : 1;
    oldStyles = getOldStyles(element);
    end = type === "in" ? 1 : 0;
    
    if (type === "out") {
        preserveOldStyles(element);
    }
    
    duration = utils.ensureIsPositive(duration);
    element.style.overflow = "hidden";
    
    if (type === "in") {
        if (window.getComputedStyle(element).display === "none") {
            element.style.display = "block";
        }
        else {
            element.style.display = "";
        }
    }
    
    return slide(
        element, 
        {
            start: start,
            end: end,
            height: toPx(oldStyles.computed.height),
            paddingTop: toPx(oldStyles.computed.paddingTop),
            paddingBottom: toPx(oldStyles.computed.paddingBottom),
            marginTop: toPx(oldStyles.computed.marginTop),
            marginBottom: toPx(oldStyles.computed.marginBottom)
        },
        duration,
        after
    );
    
    function after () {
        
        element.removeAttribute(BLOCKING_ATTRIBUTE);
        
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

function toPx (value) {
    
    value = parseInt(value, 10);
    
    return (value ? value : 0);
}

function hasHeight (element) {
    
    var height;
    var style = window.getComputedStyle(element);
    
    if (style.display === "none") {
        element.style.display = "block";
        height = window.getComputedStyle(element).height;
        element.style.display = "none";
    }
    else {
        height = style.height;
    }
    
    return height !== "0px";
}

function slideIn (element, duration, then) {
    
    if (window.getComputedStyle(element).display !== "none" && hasHeight(element)) {
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
