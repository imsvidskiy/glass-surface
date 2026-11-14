---
"@imsvidskiy/glass-surface": minor
"@imsvidskiy/glass-surface-react": minor
---

`@imsvidskiy/glass-surface-react` exports the `GlassSurfaceInput` type: the
options of the surface without the props that the component adds.

`createGlassSurface` patches the SVG filter in place when an option changes
instead of building it again, so the browser doesn't reload the displacement
map for a change that leaves it as it was.

`@imsvidskiy/glass-surface-react` joins class names with `clsx`, its one new
dependency.

A code pass gave every helper and type one owner, split the WebGL renderer
into the part that decides when to draw and the part that draws, and added
unit tests. The stylesheet is shorter. The surface renders the same.
