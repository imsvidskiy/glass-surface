---
"@svidskiy/glass-surface": major
"@svidskiy/glass-surface-react": major
---

Match the original GlassSurface one to one.

- `renderer: "auto"` uses the SVG filter wherever it is supported and WebGL only elsewhere; `renderer: "webgl"` still forces WebGL.
- The defaults are the original ones: `borderWidth` 0.07, `blur` 11, `displace` 0, `backgroundOpacity` 0, `saturation` 1, `distortionScale` -180, `greenOffset` 10, `blueOffset` 20, `yChannel` "G".
- The shape map carries the vertical slope in the green channel and the flat level in blue.
- The rectangle map follows the rendered box, transforms included.
- The radius, and the outline or hidden state of a shape, are inline and win over the element's own `style`.
- A broken backdrop image is skipped instead of turning WebGL off; a shape URL with line breaks still masks.
