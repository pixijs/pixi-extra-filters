(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    PIXI.filters.AbstractFilter.call(this,
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

GlowFilter.prototype = Object.create(PIXI.filters.AbstractFilter.prototype);
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = {
    GlowFilter: require('./filters/glow/GlowFilter'),
    OutlineFilter: require('./filters/outline/OutlineFilter')
};

for (var filter in module.exports) {
    PIXI.filters[filter] = module.exports[filter];
}

},{"./filters/glow/GlowFilter":1,"./filters/outline/OutlineFilter":2}]},{},[3])


//# sourceMappingURL=pixi-extra-filters.js.map
