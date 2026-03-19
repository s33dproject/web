precision highp float;
uniform sampler2D tex;
uniform float time;
uniform vec2 resolution;
uniform float displacement;
uniform float hueShift;
uniform float blend;

varying vec2 vUv;

#pragma glslify: noise = require('glsl-noise/simplex/3d');
#pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

vec3 rgb2hsl(vec3 c) {
  float maxC = max(max(c.r, c.g), c.b);
  float minC = min(min(c.r, c.g), c.b);
  float l = (maxC + minC) * 0.5;
  if (maxC == minC) return vec3(0.0, 0.0, l);
  float d = maxC - minC;
  float s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);
  float h;
  if (maxC == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
  else if (maxC == c.g) h = (c.b - c.r) / d + 2.0;
  else h = (c.r - c.g) / d + 4.0;
  h /= 6.0;
  return vec3(h, s, l);
}

void main() {
  vec2 uv = vUv;
  vec3 coord = vec3(uv * 4.0, time * 0.5);
  float n = noise(coord);
  float n2 = noise(coord * 1.7 + 10.0);
  uv += vec2(n, n2) * displacement;
  uv = fract(uv);

  vec4 texColor = texture2D(tex, uv);
  vec3 hsl = rgb2hsl(texColor.rgb);
  hsl.x = fract(hsl.x + hueShift);
  hsl.y = clamp(hsl.y * 1.2, 0.0, 1.0);
  vec3 shifted = hsl2rgb(hsl);

  float noiseVal = noise(vec3(gl_FragCoord.xy * 0.01, time * 0.3)) * 0.5 + 0.5;
  vec3 noiseColor = hsl2rgb(vec3(noiseVal + time * 0.05, 0.6, 0.5));
  vec3 final = mix(shifted, noiseColor, blend);

  gl_FragColor = vec4(final, 1.0);
}
