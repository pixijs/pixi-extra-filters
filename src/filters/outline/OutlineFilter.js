/**
 * OutlineFilter, originally by mishaa
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 * http://codepen.io/mishaa/pen/emGNRB
 * 
 * @class
 * @param viewWidth {number} The width of the view to draw to, usually renderer.width.
 * @param viewHeight {number} The height of the view to draw to, usually renderer.height.
 * @param thickness {number} The tickness of the outline.
 * @param color {number} The color of the glow.
 * 
 * @example
 *  someSprite.shader = new OutlineFilter(renderer.width, renderer.height, 9, 0xFF0000);
 */
function OutlineFilter(viewWidth, viewHeight, thickness, color) {
    PIXI.filters.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        [
            'precision mediump float;',

            'varying vec2 vTextureCoord;',
            'uniform sampler2D uSampler;',

            'uniform float thickness;',
            'uniform vec4 outlineColor;',
            'uniform float pixelWidth;',
            'uniform float pixelHeight;',
            'vec2 px = vec2(pixelWidth, pixelHeight);',

            'void main(void) {',
            '    const float PI = 3.14159265358979323846264;',
            '    vec4 ownColor = texture2D(uSampler, vTextureCoord);',
            '    vec4 curColor;',
            '    float maxAlpha = 0.;',
            '    for (float angle = 0.; angle < PI * 2.; angle += ' + (1 / thickness).toFixed(7) + ') {',
            '        curColor = texture2D(uSampler, vec2(vTextureCoord.x + thickness * px.x * cos(angle), vTextureCoord.y + thickness * px.y * sin(angle)));',
            '        maxAlpha = max(maxAlpha, curColor.a);',
            '    }',
            '    float resultAlpha = max(maxAlpha, ownColor.a);',
            '    gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            thickness: { type: '1f', value: thickness },
            outlineColor: { type: '4f', value: new Float32Array([0, 0, 0, 1]) },
            pixelWidth: { type: '1f', value: null },
            pixelHeight: { type: '1f', value: null },
        }
    );

    this.color = color;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
};

OutlineFilter.prototype = Object.create(PIXI.filters.AbstractFilter.prototype);
OutlineFilter.prototype.constructor = OutlineFilter;
module.exports = OutlineFilter;

Object.defineProperties(OutlineFilter.prototype, {
    color: {
        get: function () {
            return PIXI.utils.rgb2hex(this.uniforms.outlineColor.value);
        },
        set: function (value) {
            PIXI.utils.hex2rgb(value, this.uniforms.outlineColor.value);
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
