# @imsvidskiy/glass-surface-react

React component for the refractive glass surface. Requires React 19.

![The playground: a glass tab bar over a backdrop and the Customize panel](https://raw.githubusercontent.com/imsvidskiy/glass-surface/main/.github/screenshots/playground.webp)

```sh
npm install @imsvidskiy/glass-surface-react
```

pnpm, yarn, and bun work the same way: `pnpm add`, `yarn add`, `bun add`.

```tsx
import "@imsvidskiy/glass-surface-react/style.css";
import { GlassSurface } from "@imsvidskiy/glass-surface-react";
import { useRef } from "react";

export function TabBar() {
  const photo = useRef<HTMLImageElement>(null);

  return (
    <>
      <img ref={photo} src="/photo.jpg" alt="" />

      <GlassSurface backdrop={photo} width={320} height={76} borderRadius={38}>
        …
      </GlassSurface>
    </>
  );
}
```

Every option of [`@imsvidskiy/glass-surface`](../core) is a prop; `width` and `height` default to 200 × 80.
`element="span"` renders the surface and its content as spans, for glass inside phrasing content such as a heading.

## License

MIT
