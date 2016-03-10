(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
* @author Julien CLEREL @JuloxRox
* original filter https://github.com/evanw/glfx.js/blob/master/src/filters/warp/bulgepinch.js by Evan Wallace : http://madebyevan.com/
*/

/**
* @filter Bulge / Pinch
* @description Bulges or pinches the image in a circle.
* @param center The x and y coordinates of the center of the circle of effect.
* @param radius The radius of the circle of effect.
* @param strength -1 to 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
*
* @class BulgePinchFilter
* @extends AbstractFilter
* @constructor
*/

function BulgePinchFilter() {
    PIXI.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        [
            'precision mediump float;',
            'uniform float radius;',
            'uniform float strength;',
            'uniform vec2 center;',
            'uniform sampler2D uSampler;',
            'uniform vec4 dimensions;',
            'varying vec2 vTextureCoord;',

            'void main()',
            '{',
                'vec2 coord = vTextureCoord * dimensions.xy;',
                'coord -= center;',
                'float distance = length(coord);',
                'if (distance < radius) {',
                    'float percent = distance / radius;',
                    'if (strength > 0.0) {',
                        'coord *= mix(1.0, smoothstep(0.0, radius /     distance, percent), strength * 0.75);',
                    '} else {',
                        'coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);',
                    '}',
                '}',
                'coord += center;',
                'gl_FragColor = texture2D(uSampler, coord / dimensions.xy);',
                'vec2 clampedCoord = clamp(coord, vec2(0.0), dimensions.xy);',
                'if (coord != clampedCoord) {',
                    'gl_FragColor.a *= max(0.0, 1.0 - length(coord - clampedCoord));',
                '}',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            dimensions: { type: '4f', value: [0,0,0,0] },
            radius: { type: '1f', value: 100 },
            strength: { type: '1f', value: 0.5 },
            center: { type: 'v2', value: {x: 150, y: 150} }
        }
    );
};

BulgePinchFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
BulgePinchFilter.prototype.constructor = BulgePinchFilter;
module.exports = BulgePinchFilter;

Object.defineProperties(BulgePinchFilter.prototype, {
    /**
     * The radius of the circle of effect.
     *
     * @property radius
     * @type Number
     */
    radius: {
        get: function ()
        {
            return this.uniforms.radius.value;
        },
        set: function (value)
        {
            this.uniforms.radius.value = value;
        }
    },
    /**
     * The strength of the effect. -1 to 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
     *
     * @property strength
     * @type Number
     */
    strength: {
        get: function ()
        {
            return this.uniforms.strength.value;
        },
        set: function (value)
        {
            this.uniforms.strength.value = value;
        }
    },
    /**
     * The x and y coordinates of the center of the circle of effect.
     *
     * @property center
     * @type Point
     */
    center: {
        get: function ()
        {
            return this.uniforms.center.value;
        },
        set: function (value)
        {
            this.uniforms.center.value = value;
        }
    }
});

},{}],2:[function(require,module,exports){
/**
 * ColoreReplaceFilter, originally by mishaa, updated by timetocode
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 *
 * @class
 * @param originalColor {FloatArray32} The color that will be changed, as a 3 component RGB e.g. new Float32Array(1.0, 1.0, 1.0)
 * @param newColor {FloatArray32} The resulting color, as a 3 component RGB e.g. new Float32Array(1.0, 0.5, 1.0)
 * @param epsilon {float} Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
 *
 * @example
 *  // replaces true red with true blue
 *  someSprite.shader = new ColorReplaceFilter(
 *   new Float32Array([1, 0, 0]),
 *   new Float32Array([0, 0, 1]),
 *   0.001
 *  );
 *  // replaces the RGB color 220, 220, 220 with the RGB color 225, 200, 215
 *  someOtherSprite.shader = new ColorReplaceFilter(
 *   new Float32Array([220/255.0, 220/255.0, 220/255.0]),
 *   new Float32Array([225/255.0, 200/255.0, 215/255.0]),
 *   0.001
 *  );
 *
 */
function ColorReplaceFilter(originalColor, newColor, epsilon) {
  PIXI.AbstractFilter.call(this,
    // vertex shader
    null,
    // fragment shader
    [
      'precision mediump float;',
      'varying vec2 vTextureCoord;',
      'uniform sampler2D texture;',
      'uniform vec3 originalColor;',
      'uniform vec3 newColor;',
      'uniform float epsilon;',
      'void main(void) {',
      '  vec4 currentColor = texture2D(texture, vTextureCoord);',
      '  vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));',
      '  float colorDistance = length(colorDiff);',
      '  float doReplace = step(colorDistance, epsilon);',
      '  gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);',
      '}'
    ].join('\n'),
    // custom unifroms
    {
      originalColor: { type: '3f', value: originalColor },
      newColor: { type: '3f', value: newColor },
      epsilon: { type: '1f', value: epsilon }
    }
  );
};

ColorReplaceFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
ColorReplaceFilter.prototype.constructor = ColorReplaceFilter;
module.exports = ColorReplaceFilter;

Object.defineProperty(ColorReplaceFilter.prototype, 'originalColor', {
  set: function (value) {
    var r = ((value & 0xFF0000) >> 16) / 255,
        g = ((value & 0x00FF00) >> 8) / 255,
        b = (value & 0x0000FF) / 255;
    this.uniforms.originalColor.value = { x: r, y: g, z: b };
    this.dirty = true;
  }
});

Object.defineProperty(ColorReplaceFilter.prototype, 'newColor', {
  set: function (value) {
    var r = ((value & 0xFF0000) >> 16) / 255,
        g = ((value & 0x00FF00) >> 8) / 255,
        b = (value & 0x0000FF) / 255;
    this.uniforms.newColor.value = { x: r, y: g, z: b };
    this.dirty = true;
  }
});

Object.defineProperty(ColorReplaceFilter.prototype, 'epsilon', {
  set: function (value) {
    this.uniforms.epsilon.value = value;
    this.dirty = true;
  }
});
},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
    PIXI.AbstractFilter.call(this,
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

OutlineFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
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

},{}],5:[function(require,module,exports){
/**
* SimpleLightmap, originally by Oza94
* http://www.html5gamedevs.com/topic/20027-pixijs-simple-lightmapping/
* http://codepen.io/Oza94/pen/EPoRxj
*
* @class
* @param lightmapTexture {PIXI.Texture} a texture where your lightmap is rendered
* @param ambientColor {Array} An RGBA array of the ambient color
* @param [resolution] {Array} An array for X/Y resolution
*
* @example
*  var lightmapTex = new PIXI.RenderTexture(renderer, 400, 300);
*
*  // ... render lightmap on lightmapTex
*
*  stageContainer.filters = [
*    new SimpleLightmapFilter(lightmapTex, [0.3, 0.3, 0.7, 0.5], [1.0, 1.0])
*  ];
*/
function SimpleLightmapFilter(lightmapTexture, ambientColor, resolution) {
    PIXI.AbstractFilter.call(
        this,
        null,
        [
            'precision mediump float;',
            'varying vec4 vColor;',
            'varying vec2 vTextureCoord;',
            'uniform sampler2D u_texture; //diffuse map',
            'uniform sampler2D u_lightmap;   //light map',
            'uniform vec2 resolution; //resolution of screen',
            'uniform vec4 ambientColor; //ambient RGB, alpha channel is intensity ',
            'void main() {',
            '    vec4 diffuseColor = texture2D(u_texture, vTextureCoord);',
            '    vec2 lighCoord = (gl_FragCoord.xy / resolution.xy);',
            '    vec4 light = texture2D(u_lightmap, vTextureCoord);',
            '    vec3 ambient = ambientColor.rgb * ambientColor.a;',
            '    vec3 intensity = ambient + light.rgb;',
            '    vec3 finalColor = diffuseColor.rgb * intensity;',
            '    gl_FragColor = vColor * vec4(finalColor, diffuseColor.a);',
            '}'
        ].join('\n'),
        {
            u_lightmap: {
                type: 'sampler2D',
                value: lightmapTexture
            },
            resolution: {
                type: '2f',
                value: new Float32Array(resolution || [1.0, 1.0])
            },
            ambientColor: {
                type: '4f',
                value: new Float32Array(ambientColor)
            }
        });
}

SimpleLightmapFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
SimpleLightmapFilter.prototype.constructor = SimpleLightmapFilter;

Object.defineProperties(SimpleLightmapFilter.prototype, {
    texture: {
        get: function () {
            return this.uniforms.u_lightmap.value;
        },
        set: function (value) {
            this.uniforms.u_lightmap.value = value;
        }
    },
    color: {
        get: function () {
            return this.uniforms.ambientColor.value;
        },
        set: function (value) {
            this.uniforms.ambientColor.value = new Float32Array(value);
        }
    },
    resolution: {
        get: function () {
            return this.uniforms.resolution.value;
        },
        set: function (value) {
            this.uniforms.resolution.value = new Float32Array(value);
        }
    }
});

module.exports = SimpleLightmapFilter;

},{}],6:[function(require,module,exports){
module.exports = {
    GlowFilter: require('./filters/glow/GlowFilter'),
    OutlineFilter: require('./filters/outline/OutlineFilter'),
    BulgePinchFilter: require('./filters/bulgepinch/BulgePinchFilter'),
    ColorReplaceFilter: require('./filters/colorreplace/ColorReplaceFilter'),
    SimpleLightmapFilter:
        require('./filters/simplelightmap/SimpleLightmapFilter')
};

for (var filter in module.exports) {
    PIXI.filters[filter] = module.exports[filter];
}

},{"./filters/bulgepinch/BulgePinchFilter":1,"./filters/colorreplace/ColorReplaceFilter":2,"./filters/glow/GlowFilter":3,"./filters/outline/OutlineFilter":4,"./filters/simplelightmap/SimpleLightmapFilter":5}]},{},[6])


//# sourceMappingURL=pixi-extra-filters.js.map
