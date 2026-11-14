import { type Size, scaleSize } from "../lib/geometry";
import { haveSameValues } from "../lib/memoize";
import type { BackdropElement, GlassSurfaceOptions } from "../options";
import { getSourceSize } from "./backdrop";
import type { Frame } from "./frame";
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

type BackdropTexture = {
  isMipmapped: boolean;
  width: number;
};

type Direction = {
  x: number;
  y: number;
};

export type Painter = {
  destroy: () => void;
  paint: (frame: Frame, options: GlassSurfaceOptions) => void;
  uploadBackdrop: (source: BackdropElement) => void;
  uploadMap: (map: HTMLCanvasElement) => void;
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

export function createPainter(canvas: HTMLCanvasElement): Painter {
  const gl = getWebgl2Context(canvas);
  const refraction = createProgram(gl, REFRACTION_SHADER, REFRACTION_UNIFORMS);
  const blur = createProgram(gl, BLUR_SHADER, BLUR_UNIFORMS);
  const copy = createProgram(gl, COPY_SHADER, COPY_UNIFORMS);
  const triangle = createTriangle(gl);
  const backdropTexture = createTexture(gl, BACKDROP_UNIT);
  const mapTexture = createTexture(gl, MAP_UNIT);
  const refracted = createPassTarget(gl, PASS_UNIT);
  const halfBlurred = createPassTarget(gl, PASS_UNIT);

  let backdrop: BackdropTexture = {
    isMipmapped: false,
    width: 0,
  };

  let passSize: Size = {
    height: 0,
    width: 0,
  };

  function uploadBackdrop(source: BackdropElement): void {
    const isMipmapped = source instanceof HTMLImageElement;

    gl.activeTexture(gl.TEXTURE0 + BACKDROP_UNIT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, isMipmapped ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);

    if (isMipmapped) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    backdrop = {
      isMipmapped,
      width: getSourceSize(source).width,
    };
  }

  function uploadMap(map: HTMLCanvasElement): void {
    gl.activeTexture(gl.TEXTURE0 + MAP_UNIT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, map);
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

  function getLevelOfDetail(frame: Frame, reduction: number): number {
    if (!backdrop.isMipmapped) {
      return 0;
    }

    const texelsPerPixel = (backdrop.width * frame.stepX) / frame.pixelRatio;

    return Math.max(0, Math.log2(texelsPerPixel / reduction));
  }

  function drawRefraction(
    frame: Frame,
    { blueOffset, distortionScale, greenOffset, redOffset, saturation, xChannel, yChannel }: GlassSurfaceOptions,
    output: WebGLFramebuffer | null,
    target: Size,
    reduction: number
  ): void {
    const { layoutHeight, layoutWidth, originX, originY, stepX, stepY } = frame;
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
    gl.uniform1f(uniforms.uLevelOfDetail, getLevelOfDetail(frame, reduction));
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

  function paint(frame: Frame, options: GlassSurfaceOptions): void {
    const { layoutHeight, layoutWidth, pixelRatio } = frame;

    const layout = {
      height: layoutHeight,
      width: layoutWidth,
    };

    const target = scaleSize(layout, pixelRatio);
    const sigma = Math.max(0, options.displace) * pixelRatio;

    resizeCanvas(target);

    if (sigma < MINIMUM_SIGMA) {
      drawRefraction(frame, options, null, target, 1);

      return;
    }

    const reduction = Math.min(1, MAXIMUM_SIGMA / sigma);
    const reduced = scaleSize(target, reduction);

    resizePasses(reduced);

    drawRefraction(frame, options, refracted.framebuffer, reduced, reduction);
    drawBlur(refracted.texture, halfBlurred.framebuffer, reduced, HORIZONTAL, sigma * reduction);
    drawBlur(halfBlurred.texture, refracted.framebuffer, reduced, VERTICAL, sigma * reduction);
    drawCopy(refracted.texture, target);
  }

  function destroy(): void {
    gl.deleteTexture(backdropTexture);
    gl.deleteTexture(mapTexture);
    deletePassTarget(gl, refracted);
    deletePassTarget(gl, halfBlurred);
    deleteTriangle(gl, triangle);
    gl.deleteProgram(refraction.handle);
    gl.deleteProgram(blur.handle);
    gl.deleteProgram(copy.handle);
  }

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

  return {
    destroy,
    paint,
    uploadBackdrop,
    uploadMap,
  };
}
