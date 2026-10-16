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

You need [Bun](https://bun.sh) 1.4 or later.

```sh
git clone https://github.com/svidskiy/glass-surface.git
cd glass-surface
bun install
bun run dev
```

`bun install` also installs the Git hooks through
[Lefthook](https://lefthook.dev). `bun run dev` opens the playground at
`http://localhost:5173`, which loads both packages from their sources, so
changes show up without a build.

## Checks

CI runs the checks below in this order on every pull request and every push to
`main`. The pre-commit hook runs `ultracite fix` on the staged files, and the
pre-push hook runs `build` and `typecheck`.

| Command | Tool | Fails on |
| --- | --- | --- |
| `bun run check` | Ultracite (Biome) | Any lint error or formatting difference; `bun run fix` fixes what it can |
| `bun run build` | tsdown, publint, attw | A build error or a problem in the published package |
| `bun run typecheck` | TypeScript | Any type error under `@tsconfig/bases/strictest` |

Fix the code rather than the rule.

## Code

### Naming and files

- Write names in full words, without abbreviations: `distanceOutside`, not
  `dOut`; `columns`, not `w`.
- Name a file after what it holds, in kebab case, such as `shape-field.ts`.
- Keep the public API in `src/index.ts`; everything else stays internal.
- No comments in code, except JSDoc on public options and types.

### Control flow

- Declare functions with `function`, never as arrow functions assigned to a
  name. Inline callbacks may be arrows.
- Keep the happy path at the left margin: check preconditions at the top and
  return early.
- Every `if` and loop body goes in braces, even for a single `return`.
- Don't use `??` or `&&` to pick values or render conditionally. Give a long
  condition a name, or split it into early returns.

### Layout

- Separate the steps of a function with one blank line: the destructuring, the
  values it prepares, the work, and the result. Statements of one kind stay
  together.
- Separate sibling elements in markup with one blank line, and members of a
  type that carry a doc comment.

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
| `core` | `@svidskiy/glass-surface`: state, maps, the filter, and the renderers |
| `react` | `@svidskiy/glass-surface-react` |
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
