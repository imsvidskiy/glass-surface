import { scaleSize } from "../canvas";
import { haveSameValues } from "../memoize";
import type { BackdropElement, GlassSurfaceOptions, Size } from "../types";
import { type BackdropVersion, getSourceSize, readBackdropVersion, resolveBackdrop } from "./backdrop";
import { type Frame, measureFrame } from "./frame";
import { createProgram } from "./program";
import {
  createPassTarget,
  createTexture,
  createTriangle,
  deletePassTarget,
  deleteTriangle,
  getWebgl2Context,
  resizePassTarget,
} from "./resources";
import {
  BLUR_SHADER,
  BLUR_UNIFORMS,
  COPY_SHADER,
  COPY_UNIFORMS,
  REFRACTION_SHADER,
  REFRACTION_UNIFORMS,
} from "./shaders";

type UploadedBackdrop = BackdropVersion & {
  element: BackdropElement;
  isMipmapped: boolean;
  width: number;
};

type Direction = {
  x: number;
  y: number;
};

type Drawing = BackdropVersion &
  Frame & {
    map: HTMLCanvasElement;
    options: GlassSurfaceOptions;
  };

export type RendererSource = {
  canvas: HTMLCanvasElement;
  element: HTMLElement;
  onFailure: () => void;
  readMap: () => HTMLCanvasElement | null;
  readOptions: () => GlassSurfaceOptions;
};

export type WebglRenderer = {
  destroy: () => void;
};

const CHANNELS = "RGBA";

const BACKDROP_UNIT = 0;
const MAP_UNIT = 1;
const PASS_UNIT = 2;

const HORIZONTAL: Direction = {
  x: 1,
  y: 0,
};

const VERTICAL: Direction = {
  x: 0,
  y: 1,
};

const MINIMUM_SIGMA = 0.3;
const MAXIMUM_SIGMA = 4;

function getLevelOfDetail(backdrop: UploadedBackdrop, frame: Frame, reduction: number): number {
  if (!backdrop.isMipmapped) {
    return 0;
  }

  const texelsPerPixel = (backdrop.width * frame.stepX) / frame.pixelRatio;

  return Math.max(0, Math.log2(texelsPerPixel / reduction));
}

export function createWebglRenderer(source: RendererSource): WebglRenderer {
  const { canvas, element, onFailure, readMap, readOptions } = source;

  const gl = getWebgl2Context(canvas);
  const refraction = createProgram(gl, REFRACTION_SHADER, REFRACTION_UNIFORMS);
  const blur = createProgram(gl, BLUR_SHADER, BLUR_UNIFORMS);
  const copy = createProgram(gl, COPY_SHADER, COPY_UNIFORMS);
  const triangle = createTriangle(gl);
  const backdropTexture = createTexture(gl, BACKDROP_UNIT);
  const mapTexture = createTexture(gl, MAP_UNIT);
  const refracted = createPassTarget(gl, PASS_UNIT);
  const halfBlurred = createPassTarget(gl, PASS_UNIT);

  const lifetime = new AbortController();

  let backdrop: UploadedBackdrop | null = null;
  let map: HTMLCanvasElement | null = null;
  let drawn: Drawing | null = null;
  let frameRequest = 0;
  let isVisible = true;

  let passSize: Size = {
    height: 0,
    width: 0,
  };

  function isRunning(): boolean {
    if (document.hidden) {
      return false;
    }

    return isVisible;
  }

  function isUploaded(next: BackdropElement, version: BackdropVersion): boolean {
    if (backdrop === null) {
      return false;
    }

    if (backdrop.element !== next) {
      return false;
    }

    return haveSameValues(version, backdrop);
  }

  function isDrawn(drawing: Drawing): boolean {
    if (drawn === null) {
      return false;
    }

    return haveSameValues(drawn, drawing);
  }

  function wake(): void {
    if (frameRequest !== 0) {
      return;
    }

    if (isRunning()) {
      frameRequest = requestAnimationFrame(renderFrame);
    }
  }

  function uploadBackdrop(next: BackdropElement): void {
    const version = readBackdropVersion(next);

    if (version === null) {
      return;
    }

    if (isUploaded(next, version)) {
      return;
    }

    const isMipmapped = next instanceof HTMLImageElement;

    gl.activeTexture(gl.TEXTURE0 + BACKDROP_UNIT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, next);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, isMipmapped ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);

    if (isMipmapped) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    backdrop = {
      ...version,
      element: next,
      isMipmapped,
      width: getSourceSize(next).width,
    };
  }

  function uploadMap(next: HTMLCanvasElement | null): void {
    if (next === null) {
      return;
    }

    if (next === map) {
      return;
    }

    gl.activeTexture(gl.TEXTURE0 + MAP_UNIT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, next);

    map = next;
  }

  function resizeCanvas(size: Size): void {
    if (haveSameValues(size, canvas)) {
      return;
    }

    canvas.width = size.width;
    canvas.height = size.height;
  }

  function resizePasses(size: Size): void {
    if (haveSameValues(size, passSize)) {
      return;
    }

    passSize = size;

    resizePassTarget(gl, refracted, PASS_UNIT, size);
    resizePassTarget(gl, halfBlurred, PASS_UNIT, size);
  }

  function drawRefraction(
    drawing: Drawing,
    output: WebGLFramebuffer | null,
    target: Size,
    levelOfDetail: number
  ): void {
    const { layoutHeight, layoutWidth, options, originX, originY, stepX, stepY } = drawing;
    const { blueOffset, distortionScale, greenOffset, redOffset, saturation, xChannel, yChannel } = options;
    const { uniforms } = refraction;

    gl.bindFramebuffer(gl.FRAMEBUFFER, output);
    gl.viewport(0, 0, target.width, target.height);
    gl.useProgram(refraction.handle);

    gl.uniform1i(uniforms.uBackdrop, BACKDROP_UNIT);
    gl.uniform1i(uniforms.uDisplacementMap, MAP_UNIT);
    gl.uniform2f(uniforms.uTargetSize, target.width, target.height);
    gl.uniform2f(uniforms.uSurfaceSize, layoutWidth, layoutHeight);
    gl.uniform2f(uniforms.uBackdropOrigin, originX, originY);
    gl.uniform2f(uniforms.uBackdropStep, stepX, stepY);
    gl.uniform1f(uniforms.uDistortionScale, distortionScale);
    gl.uniform3f(uniforms.uChannelOffset, redOffset, greenOffset, blueOffset);
    gl.uniform1i(uniforms.uHorizontalChannel, CHANNELS.indexOf(xChannel));
    gl.uniform1i(uniforms.uVerticalChannel, CHANNELS.indexOf(yChannel));
    gl.uniform1f(uniforms.uLevelOfDetail, levelOfDetail);
    gl.uniform1f(uniforms.uSaturation, saturation);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function drawBlur(
    input: WebGLTexture,
    output: WebGLFramebuffer,
    target: Size,
    direction: Direction,
    sigma: number
  ): void {
    const { uniforms } = blur;

    gl.bindFramebuffer(gl.FRAMEBUFFER, output);
    gl.viewport(0, 0, target.width, target.height);
    gl.useProgram(blur.handle);

    gl.activeTexture(gl.TEXTURE0 + PASS_UNIT);
    gl.bindTexture(gl.TEXTURE_2D, input);

    gl.uniform1i(uniforms.uSource, PASS_UNIT);
    gl.uniform2f(uniforms.uDirection, direction.x, direction.y);
    gl.uniform2f(uniforms.uTargetSize, target.width, target.height);
    gl.uniform1f(uniforms.uSigma, sigma);
    gl.uniform1i(uniforms.uRadius, Math.ceil(sigma * 3));

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function drawCopy(input: WebGLTexture, target: Size): void {
    const { uniforms } = copy;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, target.width, target.height);
    gl.useProgram(copy.handle);

    gl.activeTexture(gl.TEXTURE0 + PASS_UNIT);
    gl.bindTexture(gl.TEXTURE_2D, input);

    gl.uniform1i(uniforms.uSource, PASS_UNIT);
    gl.uniform2f(uniforms.uTargetSize, target.width, target.height);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function draw(uploaded: UploadedBackdrop, drawing: Drawing): void {
    const { layoutHeight, layoutWidth, options, pixelRatio } = drawing;

    const layout = {
      height: layoutHeight,
      width: layoutWidth,
    };

    const target = scaleSize(layout, pixelRatio);
    const sigma = Math.max(0, options.displace) * pixelRatio;

    resizeCanvas(target);

    if (sigma < MINIMUM_SIGMA) {
      drawRefraction(drawing, null, target, getLevelOfDetail(uploaded, drawing, 1));

      return;
    }

    const reduction = Math.min(1, MAXIMUM_SIGMA / sigma);
    const reduced = scaleSize(target, reduction);

    resizePasses(reduced);

    drawRefraction(drawing, refracted.framebuffer, reduced, getLevelOfDetail(uploaded, drawing, reduction));
    drawBlur(refracted.texture, halfBlurred.framebuffer, reduced, HORIZONTAL, sigma * reduction);
    drawBlur(halfBlurred.texture, refracted.framebuffer, reduced, VERTICAL, sigma * reduction);
    drawCopy(refracted.texture, target);
  }

  function renderSurface(): void {
    const options = readOptions();
    const backdropElement = resolveBackdrop(options.backdrop);

    if (backdropElement === null) {
      return;
    }

    uploadBackdrop(backdropElement);
    uploadMap(readMap());

    if (backdrop === null) {
      return;
    }

    if (map === null) {
      return;
    }

    const frame = measureFrame(element, backdropElement);

    if (frame === null) {
      return;
    }

    const drawing: Drawing = {
      ...frame,
      map,
      options,
      source: backdrop.source,
      time: backdrop.time,
    };

    if (isDrawn(drawing)) {
      return;
    }

    drawn = drawing;

    draw(backdrop, drawing);
  }

  function renderFrame(): void {
    frameRequest = 0;

    if (!isRunning()) {
      return;
    }

    frameRequest = requestAnimationFrame(renderFrame);

    try {
      renderSurface();
    } catch {
      onFailure();
    }
  }

  const visibilityObserver = new IntersectionObserver((entries) => {
    isVisible = entries.some((entry) => {
      return entry.isIntersecting;
    });

    wake();
  });

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

  visibilityObserver.observe(element);

  document.addEventListener("visibilitychange", wake, {
    signal: lifetime.signal,
  });

  canvas.addEventListener("webglcontextlost", onFailure, {
    signal: lifetime.signal,
  });

  wake();

  return {
    destroy() {
      lifetime.abort();
      cancelAnimationFrame(frameRequest);
      visibilityObserver.disconnect();

      gl.deleteTexture(backdropTexture);
      gl.deleteTexture(mapTexture);
      deletePassTarget(gl, refracted);
      deletePassTarget(gl, halfBlurred);
      deleteTriangle(gl, triangle);
      gl.deleteProgram(refraction.handle);
      gl.deleteProgram(blur.handle);
      gl.deleteProgram(copy.handle);
    },
  };
}
