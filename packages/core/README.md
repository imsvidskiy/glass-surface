# @svidskiy/glass-surface

Refractive glass surface for any element, without a framework.

![The playground: a glass tab bar over a backdrop and the Customize panel](https://raw.githubusercontent.com/svidskiy/glass-surface/main/.github/screenshots/playground.webp)

```sh
npm install @svidskiy/glass-surface
```

pnpm, yarn, and bun work the same way: `pnpm add`, `yarn add`, `bun add`.

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

`renderer: "auto"` picks the SVG filter in Chromium and WebGL elsewhere when a backdrop is given; `renderer: "webgl"` picks WebGL wherever a backdrop is given.

## License

MIT
