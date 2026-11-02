# deepmerge 4.3.1

No fixed release is published for CVE-2026-93753 as of 2026-10-29; 4.3.1 is still
the latest npm release. This patch backports the `__proto__` key checks from
[upstream PR #274](https://github.com/TehShrike/deepmerge/pull/274) to `index.js`
and both distributed entry points (`dist/cjs.js` and `dist/umd.js`). Both the
target-copy and source-merge loops must reject the key, regardless of the
target's shape. Other keys and merge options retain their existing behavior.

Yarn 1 applies the patch through `postinstall` and fails if it cannot apply.
Install scripts must remain enabled. `postinstall-postinstall` also reapplies it
after `yarn remove`, as recommended by patch-package for Yarn 1.

Replace this backport with an upstream fixed release when one is available.
Run `yarn test:security` to check prototype poisoning and merge compatibility.

# minimatch 10.2.6

No compatible fixed release is published for CVE-2026-118764 as of 2026-11-02.
The fixed 11.x releases (including latest 11.0.4) remove `makeRe` and replace the
RegExp pattern rows consumed by glob 7. Even a basic `glob.sync('*.js')` fails
with 11.0.1 and 11.0.4. Upgrading those consumers would require a broader
migration of the legacy React development toolchain.

Resolve every minimatch copy to the latest 10.x release, 10.2.6, and backport
[upstream commit 77a0f5c](https://github.com/isaacs/minimatch/commit/77a0f5c4b80bdc641c3c930a1d9edf5ad2db57f8)
to both its CommonJS and ESM entry points. The backport caps `**/..` expansion at
`braceExpandMax` (default 100,000) and skips pairwise optimization above 1,000
patterns. Two CommonJS compatibility adjustments preserve the callable export
expected by ESLint and the stringifiable globstar marker expected by glob 7
when it joins pattern rows. Named exports remain available. No matching algorithm
is reimplemented.

This dependency requires Node 18, 20, or >=22. Install scripts must remain enabled
so `patch-package --error-on-fail` applies the patch. `yarn test:security` covers
both patched module formats and the existing glob, recursive-readdir and ESLint
consumers. Replace this backport when a compatible fixed release is available.
