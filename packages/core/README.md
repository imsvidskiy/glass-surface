# @svidskiy/glass-surface

Refractive glass surface for any element, without a framework.

![A glass tab bar refracting a mountain sunset](https://raw.githubusercontent.com/svidskiy/glass-surface/main/.github/screenshots/hero.webp)

```sh
bun add @svidskiy/glass-surface
```

```ts
import "@svidskiy/glass-surface/style.css";
import { createGlassSurface } from "@svidskiy/glass-surface";

const surface = createGlassSurface(document.querySelector("#panel"), {
  backdrop: document.querySelector("#photo"),
});

surface.update({ distortionScale: -90 });
surface.destroy();
```

## Renderers

- **WebGL** refracts an `<img>`, `<video>` or `<canvas>` passed as `backdrop`, with smooth sampling.
- **SVG** refracts whatever is behind the element through `backdrop-filter`; Chromium only.
- **Fallback** is frosted glass for every other case.

`renderer: "auto"` picks WebGL when a backdrop is given and the SVG filter otherwise.

## License

MIT
