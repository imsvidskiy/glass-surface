# @svidskiy/glass-surface-react

React component for the refractive glass surface. Requires React 19.

![A glass tab bar refracting a mountain sunset](https://raw.githubusercontent.com/svidskiy/glass-surface/main/.github/screenshots/hero.webp)

```sh
bun add @svidskiy/glass-surface-react
```

```tsx
import "@svidskiy/glass-surface-react/style.css";
import { GlassSurface } from "@svidskiy/glass-surface-react";
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

Every option of [`@svidskiy/glass-surface`](../core) is a prop; `width` and `height` default to 200 × 80.

## License

MIT
