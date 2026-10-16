import type {
  BackdropElement,
  ColorChannel,
  GlassSurfaceOptions,
  Size,
} from "../types";
import {
  getContext2d,
  getPixelRatio,
  isEmptySize,
  loadImage,
} from "../utilities";
import {
  getContentBox,
  getFrameKey,
  getSourceSize,
  resolveBackdrop,
} from "./backdrop";
import { createGlassProgram } from "./program";
import { POSITION_LOCATION } from "./shaders";

const UNIFORM_NAMES = [
  "uBackdrop",
  "uDisplacementMap",
  "uCanvasSize",
  "uSurfaceSize",
  "uBackdropOrigin",
  "uBackdropStep",
  "uChannelScale",
  "uHorizontalChannel",
  "uVerticalChannel",
  "uSpread",
  "uLevelOfDetail",
  "uSaturation",
] as const;

const CHANNEL_MASKS: Record<ColorChannel, [number, number, number, number]> = {
  A: [0, 0, 0, 1],
  B: [0, 0, 1, 0],
  G: [0, 1, 0, 0],
  R: [1, 0, 0, 0],
};

const BACKDROP_UNIT = 0;
const MAP_UNIT = 1;

const FULL_SCREEN_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

const MINIMUM_TEXELS = 1e-6;

type Uniforms = Record<
  (typeof UNIFORM_NAMES)[number],
  WebGLUniformLocation | null
>;

export type RendererSettings = Pick<
  GlassSurfaceOptions,
  | "backdrop"
  | "displace"
  | "saturation"
  | "distortionScale"
  | "redOffset"
  | "greenOffset"
  | "blueOffset"
  | "xChannel"
  | "yChannel"
> & { displacementMap: string };

export interface RendererTargets {
  canvas: HTMLCanvasElement;
  element: HTMLElement;
  onFailure: () => void;
  readSettings: () => RendererSettings;
}

export interface WebglRenderer {
  destroy: () => void;
}

interface UploadedBackdrop {
  key: string;
  mipmapped: boolean;
  size: Size;
  source: BackdropElement;
}

function getWebgl2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    stencil: false,
  });

  if (!gl) {
    throw new Error("WebGL 2 is unavailable");
  }

  return gl;
}

function createTexture(gl: WebGL2RenderingContext, unit: number): WebGLTexture {
  const texture = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

function getLevelOfDetail(
  backdrop: UploadedBackdrop,
  content: Size,
  scale: number,
  displace: number
): number {
  if (!backdrop.mipmapped) {
    return 0;
  }

  const texelsPerUnit = (backdrop.size.width / content.width) * scale;
  const texelsPerPixel = texelsPerUnit / getPixelRatio();
  const spreadTexels = texelsPerUnit * Math.max(0, displace);

  return Math.max(
    0,
    Math.log2(Math.max(texelsPerPixel, spreadTexels * 0.5, MINIMUM_TEXELS))
  );
}

export function createWebglRenderer(targets: RendererTargets): WebglRenderer {
  const { element, canvas, readSettings, onFailure } = targets;

  const gl = getWebgl2Context(canvas);
  const program = createGlassProgram(gl);
  const vertexArray = gl.createVertexArray();
  const vertexBuffer = gl.createBuffer();

  gl.useProgram(program);
  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, FULL_SCREEN_TRIANGLE, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(POSITION_LOCATION);
  gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

  const uniformEntries = UNIFORM_NAMES.map((name) => [
    name,
    gl.getUniformLocation(program, name),
  ]);
  const uniforms = Object.fromEntries(uniformEntries) as Uniforms;

  const backdropTexture = createTexture(gl, BACKDROP_UNIT);
  const mapTexture = createTexture(gl, MAP_UNIT);

  gl.uniform1i(uniforms.uBackdrop, BACKDROP_UNIT);
  gl.uniform1i(uniforms.uDisplacementMap, MAP_UNIT);

  const mapCanvas = document.createElement("canvas");
  const mapContext = getContext2d(mapCanvas);
  const lifetime = new AbortController();

  let backdrop: UploadedBackdrop | null = null;
  let mapUrl = "";
  let mapReady = false;
  let frame = 0;
  let visible = true;
  let drawnSignature = "";

  function isRunning(): boolean {
    return visible && !document.hidden;
  }

  function wake(): void {
    if (frame !== 0) {
      return;
    }

    if (isRunning()) {
      frame = requestAnimationFrame(tick);
    }
  }

  async function loadDisplacementMap(url: string): Promise<void> {
    mapUrl = url;

    const image = await loadImage(url).catch(function ignoreFailure() {
      return null;
    });

    const outdated = url !== mapUrl || lifetime.signal.aborted;

    if (image === null || outdated) {
      return;
    }

    const pixelRatio = getPixelRatio();

    mapCanvas.width = Math.max(1, Math.round(element.offsetWidth * pixelRatio));
    mapCanvas.height = Math.max(
      1,
      Math.round(element.offsetHeight * pixelRatio)
    );
    mapContext.drawImage(image, 0, 0, mapCanvas.width, mapCanvas.height);

    gl.activeTexture(gl.TEXTURE0 + MAP_UNIT);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      mapCanvas
    );

    mapReady = true;
    drawnSignature = "";
  }

  function uploadBackdrop(source: BackdropElement): void {
    const key = getFrameKey(source);
    const uploaded = backdrop?.source === source && backdrop.key === key;

    if (key === "" || uploaded) {
      return;
    }

    const mipmapped = source instanceof HTMLImageElement;

    gl.activeTexture(gl.TEXTURE0 + BACKDROP_UNIT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    if (mipmapped) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      mipmapped ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
    );

    backdrop = { key, mipmapped, size: getSourceSize(source), source };
  }

  function draw(
    source: BackdropElement,
    uploaded: UploadedBackdrop,
    settings: RendererSettings
  ): void {
    const layout = { height: element.offsetHeight, width: element.offsetWidth };
    const content = getContentBox(source);

    if (isEmptySize(layout) || isEmptySize(content)) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const pixelRatio = getPixelRatio();
    const width = Math.max(1, Math.round(layout.width * pixelRatio));
    const height = Math.max(1, Math.round(layout.height * pixelRatio));

    const {
      distortionScale,
      redOffset,
      greenOffset,
      blueOffset,
      xChannel,
      yChannel,
      displace,
      saturation,
    } = settings;

    const signature = [
      bounds.left,
      bounds.top,
      bounds.width,
      bounds.height,
      content.x,
      content.y,
      content.width,
      content.height,
      width,
      height,
      uploaded.key,
      mapUrl,
      displace,
      saturation,
      distortionScale,
      redOffset,
      greenOffset,
      blueOffset,
      xChannel,
      yChannel,
    ].join("|");

    if (signature === drawnSignature) {
      return;
    }

    drawnSignature = signature;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const scaleX = bounds.width / layout.width;
    const scaleY = bounds.height / layout.height;

    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.uCanvasSize, width, height);
    gl.uniform2f(uniforms.uSurfaceSize, layout.width, layout.height);
    gl.uniform2f(
      uniforms.uBackdropOrigin,
      (bounds.left - content.x) / content.width,
      (bounds.top - content.y) / content.height
    );
    gl.uniform2f(
      uniforms.uBackdropStep,
      scaleX / content.width,
      scaleY / content.height
    );
    gl.uniform3f(
      uniforms.uChannelScale,
      distortionScale + redOffset,
      distortionScale + greenOffset,
      distortionScale + blueOffset
    );
    gl.uniform4fv(uniforms.uHorizontalChannel, CHANNEL_MASKS[xChannel]);
    gl.uniform4fv(uniforms.uVerticalChannel, CHANNEL_MASKS[yChannel]);
    gl.uniform1f(uniforms.uSpread, Math.max(0, displace));
    gl.uniform1f(
      uniforms.uLevelOfDetail,
      getLevelOfDetail(uploaded, content, scaleX, displace)
    );
    gl.uniform1f(uniforms.uSaturation, saturation);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function tick(): void {
    frame = 0;

    if (!isRunning()) {
      return;
    }

    frame = requestAnimationFrame(tick);

    const settings = readSettings();

    if (settings.displacementMap !== mapUrl) {
      loadDisplacementMap(settings.displacementMap);
    }

    const source = resolveBackdrop(settings.backdrop);

    if (!source) {
      return;
    }

    try {
      uploadBackdrop(source);
    } catch {
      onFailure();

      return;
    }

    if (backdrop === null || !mapReady) {
      return;
    }

    draw(source, backdrop, settings);
  }

  function handleContextLost(event: Event): void {
    event.preventDefault();
    onFailure();
  }

  const intersectionObserver = new IntersectionObserver(
    function handleIntersection(entries) {
      visible = entries.some((entry) => entry.isIntersecting);
      wake();
    }
  );

  intersectionObserver.observe(element);
  document.addEventListener("visibilitychange", wake, {
    signal: lifetime.signal,
  });
  canvas.addEventListener("webglcontextlost", handleContextLost, {
    signal: lifetime.signal,
  });
  wake();

  return {
    destroy() {
      lifetime.abort();
      cancelAnimationFrame(frame);
      intersectionObserver.disconnect();

      gl.deleteTexture(backdropTexture);
      gl.deleteTexture(mapTexture);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteVertexArray(vertexArray);
      gl.deleteProgram(program);
    },
  };
}
