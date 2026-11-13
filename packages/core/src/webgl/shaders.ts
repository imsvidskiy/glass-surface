export const POSITION_LOCATION = 0;

export const REFRACTION_UNIFORMS = [
  "uBackdrop",
  "uBackdropOrigin",
  "uBackdropStep",
  "uChannelOffset",
  "uDisplacementMap",
  "uDistortionScale",
  "uHorizontalChannel",
  "uLevelOfDetail",
  "uSaturation",
  "uSurfaceSize",
  "uTargetSize",
  "uVerticalChannel",
] as const;

export const BLUR_UNIFORMS = [
  "uDirection",
  "uRadius",
  "uSigma",
  "uSource",
  "uTargetSize",
] as const;

export const COPY_UNIFORMS = [
  "uSource",
  "uTargetSize",
] as const;

export const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const REFRACTION_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uBackdrop;
uniform sampler2D uDisplacementMap;
uniform vec2 uTargetSize;
uniform vec2 uSurfaceSize;
uniform vec2 uBackdropOrigin;
uniform vec2 uBackdropStep;
uniform float uDistortionScale;
uniform vec3 uChannelOffset;
uniform int uHorizontalChannel;
uniform int uVerticalChannel;
uniform float uLevelOfDetail;
uniform float uSaturation;

out vec4 outColor;

vec4 sampleBackdrop(vec2 base, vec2 shift, float offset) {
  return textureLod(uBackdrop, base + shift * (uDistortionScale + offset) * uBackdropStep, uLevelOfDetail);
}

vec4 sampleRefracted(vec2 point) {
  vec4 map = texture(uDisplacementMap, clamp(point / uSurfaceSize, 0.0, 1.0));
  vec2 shift = vec2(map[uHorizontalChannel], map[uVerticalChannel]) - 0.5;
  vec2 base = uBackdropOrigin + point * uBackdropStep;

  vec4 red = sampleBackdrop(base, shift, uChannelOffset.r);
  vec4 green = sampleBackdrop(base, shift, uChannelOffset.g);
  vec4 blue = sampleBackdrop(base, shift, uChannelOffset.b);

  return vec4(red.r, green.g, blue.b, (red.a + green.a + blue.a) / 3.0);
}

vec3 saturate(vec3 color) {
  mat3 saturation = mat3(
    0.213 + 0.787 * uSaturation, 0.213 - 0.213 * uSaturation, 0.213 - 0.213 * uSaturation,
    0.715 - 0.715 * uSaturation, 0.715 + 0.285 * uSaturation, 0.715 - 0.715 * uSaturation,
    0.072 - 0.072 * uSaturation, 0.072 - 0.072 * uSaturation, 0.072 + 0.928 * uSaturation
  );

  return clamp(saturation * color, 0.0, 1.0);
}

void main() {
  vec2 point = vec2(gl_FragCoord.x, uTargetSize.y - gl_FragCoord.y) / uTargetSize * uSurfaceSize;
  vec4 refracted = sampleRefracted(point);
  vec3 color = refracted.a > 0.0 ? refracted.rgb / refracted.a : vec3(0.0);

  outColor = vec4(saturate(color) * refracted.a, refracted.a);
}`;

export const BLUR_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uSource;
uniform vec2 uDirection;
uniform vec2 uTargetSize;
uniform float uSigma;
uniform int uRadius;

out vec4 outColor;

float weigh(float distance) {
  return exp(-(distance * distance) / (2.0 * uSigma * uSigma));
}

void main() {
  vec2 center = gl_FragCoord.xy / uTargetSize;
  vec2 texel = uDirection / vec2(textureSize(uSource, 0));

  vec4 sum = texture(uSource, center);
  float total = 1.0;

  for (int tap = 1; tap <= uRadius; tap += 2) {
    float near = float(tap);
    float far = near + 1.0;
    float nearWeight = weigh(near);
    float farWeight = tap < uRadius ? weigh(far) : 0.0;
    float weight = nearWeight + farWeight;
    float offset = (near * nearWeight + far * farWeight) / weight;

    sum += (texture(uSource, center + texel * offset) + texture(uSource, center - texel * offset)) * weight;
    total += 2.0 * weight;
  }

  outColor = sum / total;
}`;

export const COPY_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uSource;
uniform vec2 uTargetSize;

out vec4 outColor;

void main() {
  outColor = texture(uSource, gl_FragCoord.xy / uTargetSize);
}`;
