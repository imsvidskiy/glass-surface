export const POSITION_LOCATION = 0;

export const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uBackdrop;
uniform sampler2D uDisplacementMap;
uniform vec2 uCanvasSize;
uniform vec2 uSurfaceSize;
uniform vec2 uBackdropOrigin;
uniform vec2 uBackdropStep;
uniform vec3 uChannelScale;
uniform vec4 uHorizontalChannel;
uniform vec4 uVerticalChannel;
uniform float uSpread;
uniform float uLevelOfDetail;
uniform float uSaturation;

out vec4 outColor;

vec4 sampleRefracted(vec2 point) {
  vec4 map = texture(uDisplacementMap, clamp(point / uSurfaceSize, 0.0, 1.0));
  vec2 shift = vec2(dot(map, uHorizontalChannel), dot(map, uVerticalChannel)) - 0.5;
  vec2 base = uBackdropOrigin + point * uBackdropStep;

  vec4 red = textureLod(uBackdrop, base + shift * uChannelScale.r * uBackdropStep, uLevelOfDetail);
  vec4 green = textureLod(uBackdrop, base + shift * uChannelScale.g * uBackdropStep, uLevelOfDetail);
  vec4 blue = textureLod(uBackdrop, base + shift * uChannelScale.b * uBackdropStep, uLevelOfDetail);

  return vec4(red.r, green.g, blue.b, (red.a + green.a + blue.a) / 3.0);
}

vec4 sampleBlurred(vec2 point) {
  vec4 color = vec4(0.0);
  float weightSum = 0.0;

  for (int row = -2; row <= 2; row++) {
    for (int column = -2; column <= 2; column++) {
      vec2 offset = vec2(float(column), float(row)) * uSpread * 0.8;
      float weight = exp(-dot(offset, offset) / (2.0 * uSpread * uSpread));

      color += sampleRefracted(point + offset) * weight;
      weightSum += weight;
    }
  }

  return color / weightSum;
}

void main() {
  vec2 point = vec2(gl_FragCoord.x, uCanvasSize.y - gl_FragCoord.y) / uCanvasSize * uSurfaceSize;
  vec4 color = uSpread < 0.05 ? sampleRefracted(point) : sampleBlurred(point);

  vec3 rgb = color.a > 0.0 ? color.rgb / color.a : vec3(0.0);
  float s = uSaturation;

  mat3 saturationMatrix = mat3(
    0.213 + 0.787 * s, 0.213 - 0.213 * s, 0.213 - 0.213 * s,
    0.715 - 0.715 * s, 0.715 + 0.285 * s, 0.715 - 0.715 * s,
    0.072 - 0.072 * s, 0.072 - 0.072 * s, 0.072 + 0.928 * s
  );

  rgb = clamp(saturationMatrix * rgb, 0.0, 1.0);
  outColor = vec4(rgb * color.a, color.a);
}`;
