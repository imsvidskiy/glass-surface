export const POSITION_LOCATION = 0;

export const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/** Bends the backdrop through the displacement map, one sample per channel, and saturates it. */
export const REFRACTION_SHADER = `#version 300 es
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

void main() {
  vec2 point = vec2(gl_FragCoord.x, uCanvasSize.y - gl_FragCoord.y) / uCanvasSize * uSurfaceSize;
  vec4 color = sampleRefracted(point);

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

/**
 * One direction of a separable Gaussian blur over every pixel within three sigma, like
 * feGaussianBlur. Pairs of taps share one linear sample, so the radius costs half as many reads.
 */
export const BLUR_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uSource;
uniform vec2 uDirection;
uniform float uSigma;
uniform int uRadius;

out vec4 outColor;

float gaussian(float distance) {
  return exp(-(distance * distance) / (2.0 * uSigma * uSigma));
}

void main() {
  vec2 size = vec2(textureSize(uSource, 0));
  vec2 uv = gl_FragCoord.xy / size;
  vec2 step = uDirection / size;

  vec4 sum = texture(uSource, uv);
  float total = 1.0;

  for (int tap = 1; tap <= uRadius; tap += 2) {
    float near = float(tap);
    float far = near + 1.0;
    float nearWeight = gaussian(near);
    float farWeight = tap + 1 <= uRadius ? gaussian(far) : 0.0;
    float weight = nearWeight + farWeight;
    float offset = (near * nearWeight + far * farWeight) / weight;

    sum += (texture(uSource, uv + step * offset) + texture(uSource, uv - step * offset)) * weight;
    total += 2.0 * weight;
  }

  outColor = sum / total;
}`;
