# DOMFx - Simple Vanilla JS DOM Effects

You need some simple effects for your website or web app but don't want to include all of jQuery
just for this? Then DOMFx can help you out.

DOMFx currently provides the following effects:

 * fade in/out/toggle
 * slide in/out/toggle

The library is designed in a modular way so that you can require effects directly without having
to ship all effects on your site even if you don't use them. This translate roughly to the
following sizes for each effect:

 * fade: 5k (raw), 2.1k (minified), 1k (minified and gzipped)
 * slide: 7.3k (raw), 3k (minified), 1.3k (minified and gzipped)

And the full library:

 * 9.2k (raw), 3.8k (minified), 1.5k (minified and gzipped)

## Installation

    npm install domfx --save

If you don't use browserify or webpack, you will have to include a script tag manually:

```html
<script src="node_modules/domfx/dist/domfx.min.js"></script>
```

## Usage

For CommonJS-enabled projects:

```javascript
var fade = require("domfx/fade");
var slide = require("domfx/slide");
var element = document.querySelector(".myElement");

fade.in(element);
fade.out(element);
fade.toggle(element);

slide.in(element);
slide.out(element);
slide.toggle(element);
```

For projects without CommonJS (using globals):

```javascript
(function () {
    
    var element = document.querySelector(".myElement");
    
    DOMFX.fade.in(element);
    DOMFX.fade.out(element);
    DOMFX.fade.toggle(element);
}());
```

Of course you can also supply a callback as the last argument to an effect's methods:

```javascript
var fade = require("domfx/fade");
var element = document.querySelector(".myElement");

fade.in(element, function () {
    console.log("Effect finished.");
});
```

The `fade` and `slide` effect's duration can also be set in milliseconds:

```javascript
fade.in(element, 2000, then);
```

## Methods

### Fade

```javascript
fade.in(element);
fade.in(element, duration);
fade.in(element, then);
fade.in(element, duration, then);
```

```javascript
fade.out(element);
fade.out(element, duration);
fade.out(element, then);
fade.out(element, duration, then);
```

```javascript
fade.toggle(element);
fade.toggle(element, duration);
fade.toggle(element, then);
fade.toggle(element, duration, then);
```

## Slide

```javascript
slide.in(element);
slide.in(element, duration);
slide.in(element, then);
slide.in(element, duration, then);
```

```javascript
slide.out(element);
slide.out(element, duration);
slide.out(element, then);
slide.out(element, duration, then);
```

```javascript
slide.toggle(element);
slide.toggle(element, duration);
slide.toggle(element, then);
slide.toggle(element, duration, then);
```
