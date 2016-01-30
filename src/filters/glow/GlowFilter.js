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
    PIXI.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        [
            'precision mediump float;',

            'varying vec2 vTextureCoord;',
            'varying vec4 vColor;',

            'uniform sampler2D uSampler;',

            'uniform float distance;',
            'uniform float outerStrength;',
            'uniform float innerStrength;',
            'uniform vec4 glowColor;',
            'uniform float pixelWidth;',
            'uniform float pixelHeight;',
            'vec2 px = vec2(pixelWidth, pixelHeight);',

            'void main(void) {',
            '    const float PI = 3.14159265358979323846264;',
            '    vec4 ownColor = texture2D(uSampler, vTextureCoord);',
            '    vec4 curColor;',
            '    float totalAlpha = 0.0;',
            '    float maxTotalAlpha = 0.0;',
            '    float cosAngle;',
            '    float sinAngle;',
            '    for (float angle = 0.0; angle <= PI * 2.0; angle += ' + (1 / quality / distance).toFixed(7) + ') {',
            '       cosAngle = cos(angle);',
            '       sinAngle = sin(angle);',
            '       for (float curDistance = 1.0; curDistance <= ' + distance.toFixed(7) + '; curDistance++) {',
            '           curColor = texture2D(uSampler, vec2(vTextureCoord.x + cosAngle * curDistance * px.x, vTextureCoord.y + sinAngle * curDistance * px.y));',
            '           totalAlpha += (distance - curDistance) * curColor.a;',
            '           maxTotalAlpha += (distance - curDistance);',
            '       }',
            '    }',
            '    maxTotalAlpha = max(maxTotalAlpha, 0.0001);',

            '    ownColor.a = max(ownColor.a, 0.0001);',
            '    ownColor.rgb = ownColor.rgb / ownColor.a;',
            '    float outerGlowAlpha = (totalAlpha / maxTotalAlpha)  * outerStrength * (1. - ownColor.a);',
            '    float innerGlowAlpha = ((maxTotalAlpha - totalAlpha) / maxTotalAlpha) * innerStrength * ownColor.a;',
            '    float resultAlpha = (ownColor.a + outerGlowAlpha);',

            '    gl_FragColor = vec4(mix(mix(ownColor.rgb, glowColor.rgb, innerGlowAlpha / ownColor.a), glowColor.rgb, outerGlowAlpha / resultAlpha) * resultAlpha, resultAlpha);',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            distance: { type: '1f', value: distance },
            outerStrength: { type: '1f', value: 0 },
            innerStrength: { type: '1f', value: 0 },
            glowColor: { type: '4f', value: new Float32Array([0, 0, 0, 1]) },
            pixelWidth: { type: '1f', value: 0 },
            pixelHeight: { type: '1f', value: 0 }
        }
    );

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

GlowFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
GlowFilter.prototype.constructor = GlowFilter;
module.exports = GlowFilter;

Object.defineProperties(GlowFilter.prototype, {
    color: {
        get: function () {
            return PIXI.utils.rgb2hex(this.uniforms.glowColor.value);
        },
        set: function(value) {
            PIXI.utils.hex2rgb(value, this.uniforms.glowColor.value);
        }
    },

    outerStrength: {
        get: function () {
            return this.uniforms.outerStrength.value;
        },
        set: function (value) {
            this.uniforms.outerStrength.value = value;
        }
    },

    innerStrength: {
        get: function () {
            return this.uniforms.innerStrength.value;
        },
        set: function (value) {
            this.uniforms.innerStrength.value = value;
        }
    },

    viewWidth: {
        get: function () {
            return 1 / this.uniforms.pixelWidth.value;
        },
        set: function(value) {
            this.uniforms.pixelWidth.value = 1 / value;
        }
    },

    viewHeight: {
        get: function () {
            return 1 / this.uniforms.pixelHeight.value;
        },
        set: function(value) {
            this.uniforms.pixelHeight.value = 1 / value;
        }
    }
});
