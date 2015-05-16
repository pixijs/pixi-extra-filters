module.exports = {
    GlowFilter: require('./filters/glow/GlowFilter'),
    OutlineFilter: require('./filters/outline/OutlineFilter')
};

for (var filter in module.exports) {
    PIXI.filters[filter] = module.exports[filter];
}
