---
"@imsvidskiy/glass-surface": major
"@imsvidskiy/glass-surface-react": major
---

Several surfaces on one page no longer drop frames in Chromium. The
displacement map is drawn once on a canvas at up to one texel per CSS pixel,
instead of being rasterized from an SVG image on every frame.

Blur at a large `displace` is fixed. The SVG filter no longer lets the
backdrop show through at the rim, and WebGL blurs at any radius for the same
cost.

Breaking changes in `@imsvidskiy/glass-surface`:

- `describeFilter` takes `(id, options, state)` and returns the attributes of
  the `<filter>` together with its primitives, or `null` when the surface
  doesn't use the SVG filter.
- `GlassSurfaceState` carries the measured `size`.
- The instance that `createGlassSurface` returns no longer exposes
  `controller`.
- `FILTER_REGION`, `FilterInput`, `getSurfaceOverrides`, `toStyleObject`,
  `SurfaceOverrides`, and `supportsSvgBackdropFilter` are removed. The classes
  from `getSurfaceClasses` and the stylesheet cover what the overrides did.

The props of the React component are unchanged.
