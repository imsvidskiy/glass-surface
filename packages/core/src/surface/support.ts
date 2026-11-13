const UNSUPPORTED_BROWSERS = /Firefox|^(?!.*Chrome).*Safari/u;

export function supportsSvgBackdropFilter(): boolean {
  if (UNSUPPORTED_BROWSERS.test(navigator.userAgent)) {
    return false;
  }

  return CSS.supports("backdrop-filter", "url(#filter)");
}
