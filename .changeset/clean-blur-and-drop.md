---
"@svidskiy/glass-surface": minor
"@svidskiy/glass-surface-react": minor
---

Blur the WebGL refraction cleanly and frost like system materials.

- WebGL refracts into a texture first, then blurs it with a separable Gaussian over every pixel within three sigma, like `feGaussianBlur`; large `displace` no longer leaves ghost copies at the edge.
- `displace` defaults to 1.2.
- The frosted fallback is a strong blur with richer color and a tint by theme, edged by a hairline, without the rim and sheen layers.
