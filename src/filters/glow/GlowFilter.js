var glslify  = require('glslify');

/**
 * GlowFilter, originally by mishaa
 * http://www.html5gamedevs.com/topic/12756-glow-filter/?hl=mishaa#entry73578
 * http://codepen.io/mishaa/pen/raKzrm
 *
 * @class
 * @param viewWidth {number} The width of the view to draw to, usually renderer.width.
 * @param viewHeight {number} The height of the view to draw to, usually renderer.height.
 * @param outerStrength {number} The strength of the glow outward from the edge of the sprite.
 * @param innerStrength {number} The strength of the glow inward from the edge of the sprite.
 * @param color {number} The color of the glow.
 * @param quality {number} A number between 0 and 1 that describes the quality of the glow.
 *
 * @example
 *  someSprite.filters = [
 *      new GlowFilter(renderer.width, renderer.height, 15, 2, 1, 0xFF0000, 0.5)
 *  ];
 */
function GlowFilter(viewWidth, viewHeight, distance, outerStrength, innerStrength, color, quality) {
    PIXI.Filter.call(this,
        // vertex shader
        // vertex shader
        glslify('./glow.vert'),
        // fragment shader
        glslify('./glow.frag')
    );

    this.uniforms.distance = distance;
    this.uniforms.glowColor = new Float32Array([0, 0, 0, 1]);

    quality = Math.pow(quality, 1/3);
    this.quality = quality;

    this.uniforms.distance.value *= quality;

    viewWidth *= quality;
    viewHeight *= quality;

    this.color = color;
    this.outerStrength = outerStrength;
    this.innerStrength = innerStrength;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
};

GlowFilter.prototype = Object.create(PIXI.Filter.prototype);
GlowFilter.prototype.constructor = GlowFilter;
module.exports = GlowFilter;

Object.defineProperties(GlowFilter.prototype, {
    color: {
        get: function () {
            return PIXI.utils.rgb2hex(this.uniforms.glowColor);
        },
        set: function(value) {
            PIXI.utils.hex2rgb(value, this.uniforms.glowColor);
        }
    },

    outerStrength: {
        get: function () {
            return this.uniforms.outerStrength;
        },
        set: function (value) {
            this.uniforms.outerStrength = value;
        }
    },

    innerStrength: {
        get: function () {
            return this.uniforms.innerStrength;
        },
        set: function (value) {
            this.uniforms.innerStrength = value;
        }
    },

    viewWidth: {
        get: function () {
            return 1 / this.uniforms.pixelWidth;
        },
        set: function(value) {
            this.uniforms.pixelWidth = 1 / value;
        }
    },

    viewHeight: {
        get: function () {
            return 1 / this.uniforms.pixelHeight;
        },
        set: function(value) {
            this.uniforms.pixelHeight = 1 / value;
        }
    }
});
