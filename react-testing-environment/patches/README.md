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
