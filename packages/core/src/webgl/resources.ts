import type { Size } from "../types";
import { POSITION_LOCATION } from "./shaders";

export type PassTarget = {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
};

export type Triangle = {
  buffer: WebGLBuffer;
  vertexArray: WebGLVertexArrayObject;
};

const FULL_SCREEN_TRIANGLE = Float32Array.of(-1, -1, 3, -1, -1, 3);

export function getWebgl2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    stencil: false,
  });

  if (gl === null) {
    throw new Error("WebGL 2 is unavailable");
  }

  return gl;
}

export function createTriangle(gl: WebGL2RenderingContext): Triangle {
  const vertexArray = gl.createVertexArray();
  const buffer = gl.createBuffer();

  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, FULL_SCREEN_TRIANGLE, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(POSITION_LOCATION);
  gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);

  return {
    buffer,
    vertexArray,
  };
}

export function deleteTriangle(gl: WebGL2RenderingContext, triangle: Triangle): void {
  gl.deleteBuffer(triangle.buffer);
  gl.deleteVertexArray(triangle.vertexArray);
}

export function createTexture(gl: WebGL2RenderingContext, unit: number): WebGLTexture {
  const texture = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

export function createPassTarget(gl: WebGL2RenderingContext, unit: number): PassTarget {
  const texture = createTexture(gl, unit);
  const framebuffer = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return {
    framebuffer,
    texture,
  };
}

export function resizePassTarget(gl: WebGL2RenderingContext, target: PassTarget, unit: number, size: Size): void {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, target.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.width, size.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
}

export function deletePassTarget(gl: WebGL2RenderingContext, target: PassTarget): void {
  gl.deleteFramebuffer(target.framebuffer);
  gl.deleteTexture(target.texture);
}
