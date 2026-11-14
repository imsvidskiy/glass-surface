const MAXIMUM_PIXEL_RATIO = 2;

export function getPixelRatio(): number {
  return Math.min(MAXIMUM_PIXEL_RATIO, window.devicePixelRatio);
}
