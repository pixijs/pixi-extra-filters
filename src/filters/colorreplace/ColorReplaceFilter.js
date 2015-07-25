/**
 * ColoreReplaceFilter, originally by mishaa, updated by timetocode
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 * 
 * @class
 * @param targetColor {FloatArray32} The color to find, as a 3 component RGB e.g. new Float32Array(1.0, 1.0, 1.0)
 * @param replacementColor {FloatArray32} The color to find, as a 3 component RGB e.g. new Float32Array(1.0, 0.5, 1.0)
 * @param epsilon {float} Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
 * 
 * @example
 *  // replaces the RGB color 220, 220, 220 with the RGB color 225, 200, 215
 *  someSprite.shader = new ColorReplaceFilter(
 *   new Float32Array([220/255.0, 220/255.0, 220/255.0]), 
 *   new Float32Array([225/255.0, 200/255.0, 215/255.0]),
 *   0.001
 * ); 
 */
var ColorReplaceFilter = function (targetColor, replacementColor, epsilon) {  
  PIXI.AbstractFilter.call(this, 
    // vertex shader
    null,
    // fragment shader
    [
      'precision mediump float;',
      'varying vec2 vTextureCoord;',
      'uniform sampler2D texture;',
      'uniform vec3 targetColor;',
      'uniform vec3 replacementColor;',
      'uniform float epsilon;',
      'void main(void) {',
      '  vec4 currentColor = texture2D(texture, vTextureCoord);',
      '  vec3 colorDiff = targetColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));',
      '  float colorDistance = length(colorDiff);',
      '  float doReplace = step(colorDistance, epsilon);',
      '  gl_FragColor = vec4(mix(currentColor.rgb, (replacementColor + colorDiff) * currentColor.a, doReplace), currentColor.a);',
      '}'
    ].join('\n'),
    // custom unifroms
    {
      targetColor: { type: '3f', value: targetColor },
      replacementColor: { type: '3f', value: replacementColor },
      epsilon: { type: '1f', value: epsilon }
    }
  );
};

ColorReplaceFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
ColorReplaceFilter.prototype.constructor = ColorReplaceFilter;

Object.defineProperty(ColorReplaceFilter.prototype, 'targetColor', {
  set: function (value) {
    var r = ((value & 0xFF0000) >> 16) / 255,
        g = ((value & 0x00FF00) >> 8) / 255,
        b = (value & 0x0000FF) / 255;
    this.uniforms.targetColor.value = { x: r, y: g, z: b };
    this.dirty = true;
  }
});

Object.defineProperty(ColorReplaceFilter.prototype, 'replacementColor', {
  set: function (value) {
    var r = ((value & 0xFF0000) >> 16) / 255,
        g = ((value & 0x00FF00) >> 8) / 255,
        b = (value & 0x0000FF) / 255;
    this.uniforms.replacementColor.value = { x: r, y: g, z: b };
    this.dirty = true;
  }
});

Object.defineProperty(ColorReplaceFilter.prototype, 'epsilon', {
  set: function (value) {
    this.uniforms.epsilon.value = value;
    this.dirty = true;
  }
});