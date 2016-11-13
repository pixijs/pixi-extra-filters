# pixi-extra-filters

Some extra filters for pixi that aren't in the core plugin.

## Usage

### Browserify

If you use browserify you can use pixi-extra-filters like this:

```js
var PIXI = require('pixi.js'),
    extraFilters = require('pixi-extra-filters');

var sprite = new PIXI.Sprite(someTexture);
sprite.filters = [new extraFilters.GlowFilter(15, 2, 1, 0xFF0000, 0.5)];
```

### Prebuilt Files

If you are just including the built files, pixi-extra-filters extends the `PIXI.filters` namespace with its filters:

```js
var sprite = new PIXI.Sprite(someTexture);
sprite.filters = [new PIXI.filters.GlowFilter(15, 2, 1, 0xFF0000, 0.5)];
```

## Building

You will need to have [node][node] setup on your machine.

Then you can install dependencies and build:

```js
npm i && npm run build
```

That will output the built distributables to `./dist`.

[node]:       http://nodejs.org/
