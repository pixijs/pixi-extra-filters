var glslify  = require('glslify');

/**
 * OutlineFilter, originally by mishaa
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 * http://codepen.io/mishaa/pen/emGNRB
 *
 * @class
 * @param thickness {number} The tickness of the outline. Make it 2 times more for resolution 2
 * @param color {number} The color of the glow.
 *
 * @example
 *  someSprite.shader = new OutlineFilter(9, 0xFF0000);
 */
function OutlineFilter(thickness, color) {
    thickness = thickness || 1;
    PIXI.Filter.call(this,
        // vertex shader
        // vertex shader
        glslify('./outline.vert'),
        // fragment shader
        glslify('./outline.frag').replace(/%THICKNESS%/gi, (1.0 / thickness).toFixed(7))
    );

    this.uniforms.thickness = thickness;
    this.uniforms.outlineColor = new Float32Array([0, 0, 0, 1]);
    if (color) {
        this.color = color;
    }
}

OutlineFilter.prototype = Object.create(PIXI.Filter.prototype);
OutlineFilter.prototype.constructor = OutlineFilter;
module.exports = OutlineFilter;

Object.defineProperties(OutlineFilter.prototype, {
    color: {
        get: function () {
            return PIXI.utils.rgb2hex(this.uniforms.outlineColor);
        },
        set: function (value) {
            PIXI.utils.hex2rgb(value, this.uniforms.outlineColor);
        }
    }
});
