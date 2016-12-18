# DOMFx - Simple Vanilla JS DOM Effects

You need some simple effects for your website or web app but don't want to include all of jQuery
just for this? Then DOMFx can help you out.

DOMFx currently provides the following effects:

 * fade in/out/toggle

The following effect will be added in a later version:

 * slide in/out/toggle

The library is designed in a modular way so that you can require effects directly without having
to ship all effects on your site even if you don't use them. This translate roughly to the
following sizes for each effect:

 * fade: 5k (raw), 2.1k (minified), 1k (minified and gzipped)

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
var element = document.querySelector(".myElement");

fade.in(element);
fade.out(element);
fade.toggle(element);
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
