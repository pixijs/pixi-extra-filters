module.exports = {
    GlowFilter: require('./filters/glow/GlowFilter'),
    OutlineFilter: require('./filters/outline/OutlineFilter'),
    BulgePinchFilter: require('./filters/bulgepinch/bulgepinch'),
    ColorReplaceFilter: require('./filters/colorreplace/ColorReplaceFilter')
};

for (var filter in module.exports) {
    PIXI.filters[filter] = module.exports[filter];
}
