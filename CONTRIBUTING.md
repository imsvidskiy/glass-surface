# Contributing

This page covers the setup, the checks a change passes, and the rules for
code, commits, and pull requests. [Releasing](docs/releasing.md) covers
releases.

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

| Path | What it holds |
| --- | --- |
| `packages/core/src/surface` | The controller, the SVG filter, the classes and custom properties, and the DOM mount |
| `packages/core/src/displacement` | The displacement maps for rectangles and shapes |
| `packages/core/src/shape` | Loading a shape image and measuring its outline |
| `packages/core/src/webgl` | The WebGL renderer, its shaders, and its resources |
| `packages/react/src` | The React component |
| `playground/src` | The playground |

## Checks

CI runs the checks below in this order on every pull request and every push to
`main`. The pre-commit hook runs `ultracite fix` on the staged files, and the
pre-push hook runs `build` and `typecheck`.

| Command | Tool | Fails on |
| --- | --- | --- |
| `bun run check` | Ultracite (Biome) | Any lint error or formatting difference; `bun run fix` fixes what it can |
| `bun run build` | tsdown, publint, attw | A build error or a problem in the published package |
| `bun run typecheck` | TypeScript | Any type error |

TypeScript runs under `@tsconfig/bases/strictest` with two exceptions. Biome
already reports unused code, and the pixel math indexes typed arrays, so
`noUncheckedIndexedAccess` is off.

There is no test suite. Check a visible change in the playground in Chromium,
which uses the SVG filter, and in Safari or Firefox, which use WebGL. Suppress
a lint rule only with a `biome-ignore` comment that gives the reason.

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
- Sort the fields of a type, the names in a destructuring, and the members of
  a union alphabetically.
- Compare and memoize typed values with `haveSameValues` and `memoizeLatest`
  instead of building string keys.

### Control flow

- Declare a helper with `function`. Arrow functions are for inline callbacks
  and always have a block body.
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
- Declare every event handler as `handle…` inside `useCallback`, never inline
  in the markup.
- Separate sibling elements in the markup with one blank line.

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
| `deps` | Dependency updates, which Dependabot opens |

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
