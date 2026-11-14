# Contributing

This page covers the setup, the layout of the project, the checks a change
passes, and the rules for code, commits, and pull requests.
[Releasing](docs/releasing.md) covers releases.

## Ways to contribute

- **Report a bug** with the bug report form. Include the package version, the
  renderer, and the browser.
- **Propose a feature** with the feature request form. Describe the problem
  before the solution.
- **Report a vulnerability** privately, as described in
  [SECURITY.md](SECURITY.md).
- **Send a pull request** for an open issue. Comment on the issue first for
  anything larger than a fix, so the approach is agreed before the work.

## Development setup

You need [Bun](https://bun.sh) in the version that `packageManager` in
`package.json` names.

```sh
git clone https://github.com/imsvidskiy/glass-surface.git
cd glass-surface
bun install
bun run dev
```

`bun install` also installs the Git hooks through
[Lefthook](https://lefthook.dev). `bun run dev` opens the playground at
`http://localhost:5173`, which loads both packages from their sources, so
changes show up without a build.

## Project layout

The repository is a Bun workspace of two published packages and the
playground. One `tsdown.config.ts` at the root builds both packages, and one
`tsconfig.base.json` and one `biome.jsonc` hold the rules for all three.

### Core

`packages/core` is `@imsvidskiy/glass-surface`. A folder of `src` imports only
from the folders above it in this table:

| Path | What it holds |
| --- | --- |
| `src/lib` | Helpers that know nothing about glass: geometry, math, canvas, blur, the distance transform, and memoization |
| `src/options.ts` | The options, their types, and their defaults |
| `src/shape` | Loading a shape image and measuring its outline |
| `src/displacement` | The displacement maps for rectangles and shapes |
| `src/webgl` | The WebGL renderer: `renderer.ts` decides when to draw, `painter.ts` draws |
| `src/surface` | The controller, the choice of a renderer, the SVG filter, the classes and custom properties, and the DOM mount |
| `src/index.ts` | The public API |
| `src/style.css` | The stylesheet that both packages ship |
| `tests` | The unit tests, in the same folders as the modules they cover |

The controller holds the state of a surface and knows nothing about markup.
`getSurfaceClasses`, `getSurfaceProperties`, and `describeFilter` turn that
state into plain data, and `mount.ts` and the React component render the same
data.

### React

`packages/react` is `@imsvidskiy/glass-surface-react`: the `GlassSurface`
component over the controller of the core. It adds no logic of its own.

### Playground

`playground` is a Vite application deployed to Cloudflare Workers. Its `src`
follows [Feature-Sliced Design](https://fsd.how):

| Path | What it holds |
| --- | --- |
| `src/app` | The entry point and the global styles |
| `src/pages/playground` | The page: `ui`, `model`, `lib`, and `config`, exported through `index.ts` |
| `src/shared` | Controls and helpers that know nothing about the page |

A layer imports only from the layers below it, through the `@/` alias. Files
of one slice import each other by relative paths.

## Checks

CI runs the checks below in this order on every pull request and every push to
`main`. The pre-commit hook runs `ultracite fix` on the staged files, and the
pre-push hook runs `build`, `typecheck`, and `test`.

| Command | Tool | Fails on |
| --- | --- | --- |
| `bun run check` | Ultracite (Biome) and Steiger | A lint error, a formatting difference, or a playground import that breaks Feature-Sliced Design; `bun run fix` fixes what it can |
| `bun run build` | tsdown, publint, and attw | A build error or a problem in the published package |
| `bun run typecheck` | TypeScript | Any type error |
| `bun run test` | The Bun test runner | A failing unit test |

TypeScript runs under `@tsconfig/bases/strictest` with one exception: the
pixel math indexes typed arrays, so `noUncheckedIndexedAccess` is off.
Suppress a lint rule only with a `biome-ignore` comment that gives the reason.

The unit tests cover the modules that run without a browser: the options, the
helpers, the choice of a renderer, the filter, and the classes. Rendering has
no automated test. Check a visible change in the playground in Chromium, which
uses the SVG filter, and in Safari or Firefox, which use WebGL.

## Code

### Naming and files

- Write names in full words, without abbreviations: `distanceOutside`, not
  `dOut`; `columns`, not `w`.
- Start a boolean with `is`, `has`, `can`, or `should`, and name a function
  with a verb and a noun, such as `measureShape`.
- Name a file after what it holds, in kebab case, such as `shape-field.ts`.
- Keep the public API in `src/index.ts`; everything else stays internal.
- Write no comments. A name carries the meaning, and the README documents the
  options. Tool directives such as `biome-ignore` are the exception.

### Types

- Declare types with `type`, not `interface`.
- Declare a type in the module that owns its values, and import it from there.
  There is no shared file of types.
- Sort the fields of a type, the keys of an object, the names in a
  destructuring, and the members of a union alphabetically.
- Compare and memoize typed values with `haveSameValues` and `memoizeLatest`
  instead of building string keys.

### Functions

- Declare a helper with `function`. Arrow functions are for inline callbacks
  and always have a block body.
- Order the parameters the same way everywhere: the context the function works
  through, such as `gl`; the value it reads or changes; the values that adjust
  the work; and a callback last.
- Pass values that have no natural order as one object, and destructure it in
  the signature unless the function also needs it whole.
- Lay out a factory such as `createPainter` as its constants, its state, its
  functions, the setup, and the returned object. The object lists declared
  functions in shorthand.

### Control flow

- Keep the happy path at the left margin: check preconditions at the top and
  return early.
- Every `if` and loop body goes in braces, even for a single `return`.
- Don't branch with `??`, `&&`, `||`, or a ternary that spans lines. Give a
  long condition a name, or split it into early returns.

### Layout

- Order a module as imports, types, constants, helpers, and exports, with each
  declaration above its first use.
- Split a function body into steps separated by one blank line: the
  destructuring, the values it prepares, the work, and the result. Statements
  of one step stay together.
- Put a blank line before and after a statement that spans lines, and before a
  `return` that isn't the only statement of its block.

### React

- Name the props type after the component, such as `GlassSurfaceProps`.
- Order a component as its state, its refs, the other hooks, the values it
  derives, the handlers, the effects, and the markup.
- Declare every event handler as `handle…` inside `useCallback`, never inline
  in the markup.
- Join class names with `clsx`.
- Separate sibling elements in the markup with one blank line.

### Styles

- A stylesheet holds one block, written as `.block`, `.block__element`, and
  `.block--modifier`. The stylesheet of a component has the name of the
  component and of its block, such as `panel-group.css` for `.panel-group`.
- Open a rule with its custom properties, then a blank line, then the
  declarations. Biome sorts the declarations.
- Split a rule of six or more declarations into its groups with one blank
  line: layout, text, and appearance.
- Lay out with flex and grid, and write `translate` and logical margins
  instead of `transform` and `margin: 0 auto`.
- Order the rules as the block, its states, its elements, and its modifiers.
- In the playground, take colors from the tokens of `global.css`.

## Commits

Commits follow
[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):
`type(scope): description`.

- Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`,
  and `chore`.
- The scope names the area a change is about, from the list below. Leave it
  out when the change spans several areas.
- The description is in the imperative, starts in lowercase, stays under 72
  characters, and has no trailing period.
- One commit is one logical change that builds and passes on its own. Add a
  body only for what the diff can't show.
- No trailers such as `Co-authored-by:` or `Signed-off-by:`.

| Scope | Area |
| --- | --- |
| `core` | `@imsvidskiy/glass-surface`: state, maps, the filter, and the renderers |
| `react` | `@imsvidskiy/glass-surface-react` |
| `playground` | The playground and its deployment |
| `release` | The version bump that prepares a release |
| `deps` and `deps-dev` | Dependency updates, which Dependabot opens |

## Pull requests

- One pull request is one standalone change.
- A change to a published package carries a changeset: run
  `bun run changeset` and describe the change for its users.
- GitHub merges a pull request with a merge commit whose subject is its title
  and whose body is its body. Write the title in commit form and the body as a
  commit body, then end it with `Verified:` and the checks you ran.
- Attach a screenshot for visible changes in a comment, so it stays out of the
  merge commit.
- CI has to pass.

## Licensing of contributions

Glass Surface is licensed under the MIT license, whose text is in
[LICENSE](LICENSE). By submitting a contribution, you agree that it is licensed
under the same terms.
