# React testing environment

Install with Yarn Classic so the lockfile, resolutions and postinstall patches
are applied. Run `yarn test:security` for the toolchain regression checks.

`decode-uri-component` is pinned to upstream 0.5.1 to fix the quadratic decoding
denial of service (CVE-2026-118664). There is no fixed CommonJS release, and even
the latest `source-map-resolve` still calls the decoder synchronously with
`require`. The versioned patch changes only the decoder's module type and export
to CommonJS; its upstream decoding algorithm is unchanged. `patch-package
--error-on-fail` makes installation fail if this compatibility patch cannot apply.
Recheck the consumer's module support before changing the decoder version.
