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
