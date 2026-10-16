# Releasing

This page describes how you turn `main` into a release on npm and GitHub
Releases. [Checks](../CONTRIBUTING.md#checks) lists what every change passes
before it reaches `main`.

## What a release is made of

| Artifact | Made by | Used by |
| --- | --- | --- |
| `@svidskiy/glass-surface` on npm | `bun run release` | JavaScript and TypeScript projects |
| `@svidskiy/glass-surface-react` on npm | `bun run release` | React projects |
| The `vX.Y.Z` release on GitHub | `gh release create` | The release notes and history |

Both packages share one version, set by the `fixed` group in
`.changeset/config.json`.

## One-time setup

1. An npm account that owns the `@svidskiy` scope, signed in with
   `bunx npm login`.

## Cutting a release

1. Merge a pull request titled `chore(release): prepare X.Y.Z` from the
   branch `release/X.Y.Z`. Its one commit,
   `chore(release): bump version to X.Y.Z`, is what `bun run version-packages`
   makes from the changesets on `main`.
2. Write the release notes in Markdown: one summary sentence, then `## Added`,
   `## Changed`, and `## Fixed`, leaving out an empty one, then
   `**Contributors**:` with the GitHub handles of the release's commit authors
   and `**Full changelog**:` with the compare link from the previous tag. Keep
   the file outside the repository.
3. Publish the packages from an up-to-date `main`:

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
