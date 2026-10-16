const UNSUPPORTED_BROWSERS = /Firefox|^(?!.*Chrome).*Safari/;

export function supportsSvgBackdropFilter(): boolean {
  if (UNSUPPORTED_BROWSERS.test(navigator.userAgent)) {
    return false;
  }

  const probe = document.createElement("div");

  probe.style.backdropFilter = "url(#glass-surface-probe)";

  return probe.style.backdropFilter !== "";
}
