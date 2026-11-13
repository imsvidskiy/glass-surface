# Releasing

This page describes how you turn `main` into a release on npm and GitHub
Releases. [Checks](../CONTRIBUTING.md#checks) lists what every change passes
before it reaches `main`.

## What a release is made of

| Artifact | Made by | Used by |
| --- | --- | --- |
| `@imsvidskiy/glass-surface` on npm | `bun run release` | JavaScript and TypeScript projects |
| `@imsvidskiy/glass-surface-react` on npm | `bun run release` | React projects |
| The `vX.Y.Z` release on GitHub | `gh release create` | The release notes and history |

Both packages share one version, set by the `fixed` group in
`.changeset/config.json`.

## One-time setup

You need an npm account that owns the `@imsvidskiy` scope, signed in with
`bunx npm login`.

## Picking the version

Raise the major version when a change breaks code written for the previous
release or changes how a surface looks with the default options, the minor
version when it adds an option, a prop or a renderer, and the patch version
otherwise. The changesets on `main` carry these bumps.

## Cutting a release

1. Merge a pull request titled `chore(release): prepare X.Y.Z` from the
   branch `release/X.Y.Z`. Its one commit,
   `chore(release): bump version to X.Y.Z`, is what `bun run version-packages`
   makes from the changesets on `main`: it bumps both packages and updates
   `bun.lock`.
2. Write the release notes, as described in [Release notes](#release-notes).
   Keep the file outside the repository.
3. Publish the packages from an up-to-date `main` in a terminal. The command
   builds both packages and publishes every version that isn't on npm yet, the
   core first, because the React package depends on it. npm asks to confirm
   each one in the browser.

   ```sh
   bun run release
   ```

4. Publish the release on GitHub, tagging the merge commit of the release
   pull request. Releases are immutable: once published, the tag can't change,
   so check the notes first.

   ```sh
   gh release create vX.Y.Z --target <commit> --title vX.Y.Z --notes-file ../notes.md
   ```

5. Deploy the playground with `bun run deploy`.

## Release notes

Write the notes for the developers who use the packages, from the pull
requests merged since the last release, and check each line against them:

- Open with one sentence: `Glass Surface X.Y.Z` and what the release brings.
- Then the sections `## Added`, `## Changed`, and `## Fixed`, each only when
  it has entries, in that order. A fix belongs in `Fixed` only when the bug
  shipped in an earlier release; a bug made and fixed between two releases is
  not listed.
- Write each entry as a full sentence about what a developer sees, with option
  and prop names in code. A breaking change opens `Changed` and says what to
  change in existing code. Refactors and dependency updates go last in
  `Changed` as one line each, such as "A code pass removed repeated work. The
  surface renders the same."
- End with `**Contributors**:` and the GitHub logins of every commit author in
  the range, bots left out, and `**Full changelog**:` with the compare link
  `https://github.com/imsvidskiy/glass-surface/compare/vPREVIOUS...vX.Y.Z`.
