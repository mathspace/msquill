# msquill threat model

## 1. Overview

msquill is a MathQuill-derived JavaScript library for editable math, static math and text fields. An application creates a field around a DOM element; the library maintains an expression tree, cursor and selection, parses LaTeX-like input, renders HTML through jQuery, and exports text, LaTeX or HTML. It runs inside the embedding page’s origin and JavaScript authority. It is not an authentication service or a storage backend. The public API constructs fields from elements and options (`src/publicapi.js:37`); the package entry point is `build/mathquill.js` (`package.json:4`).

The normal runtime is an application bundle containing the checked-in or rebuilt CommonJS artifact and a host-provided jQuery resolution. A separate developer server watches source and rebuilds tests. That server has filesystem and process authority which the browser field does not possess. Build and developer tools must therefore remain distinct from the embedded component.

| Component | Input and purpose | Source |
| --- | --- | --- |
| Public field API | DOM element, options, LaTeX and edit commands | `src/publicapi.js:37` |
| Parser/controller | Expression text → command tree → field update | `src/services/latex.js:86`, `src/services/latex.js:107` |
| Text/tree rendering | Command HTML and text nodes → jQuery DOM insertion | `src/commands/text.js:68`, `src/tree.js:105` |
| Configurable grammar | Per-controller dictionaries and caller-supplied symbol definitions | `src/services/commands.js:3`, `src/services/commands.js:94` |
| Developer HTTP/build tool | Request paths, filesystem watches, local test execution | `script/test_server.js:13`, `script/test_server.js:78` |

| Workflow | Configuration chain | Effective resource | Recipients | Control or obligation | Evidence |
| --- | --- | --- | --- | --- | --- |
| Library loading | Package main → distributed artifact | `build/mathquill.js`, requiring `jquery` | Host bundle/browser | Trusted dependency and artifact provenance | `package.json:4`, `build/mathquill.js:1` |
| Expression rendering | `latex`/write → parser → command HTML | Caller-owned `.mq-root-block` DOM | Scripts/users in host origin | Full-input syntax checks; HTML safety belongs to rendering implementations | `src/services/latex.js:92`, `src/services/latex.js:126` |
| Symbol definitions | Host options → grammar processor → constructor | `htmlEntity` is rendering content, per-controller grammar dictionaries are in memory | Browser DOM in the host origin | Trusted application configuration required | `src/services/commands.js:3`, `src/services/commands.js:94` |
| Development serving | `HOST`/`PORT`, otherwise defaults; normalize request pathname and remove leading slash | `0.0.0.0:9292`; files relative to process working directory | Reachable HTTP clients | OS file permissions; host must restrict listener and workspace | `script/test_server.js:9`, `script/test_server.js:24` |
| Development builds | Startup and watched-file changes → shell command | `make test`, inherited working directory/environment | Developer account and tools | Trusted local source/build authority | `script/test_server.js:15`, `script/test_server.js:78` |

The Makefile describes full/basic/minified outputs and distribution paths. The important renderer and text-serialization behavior is also present in the package’s main artifact, so it is not merely an unused source surface (`Makefile:48`, `build/mathquill.js:2166`, `build/mathquill.js:3175`). This review does not establish byte-for-byte build reproducibility.

## 2. Threat Model, Trust Boundaries, and Assumptions

The protected assets are host-origin DOM integrity, expression fidelity, editor availability, and the developer workspace when its server is started. Confidentiality depends on the embedding page’s access controls: node IDs and field lookup APIs are object references, not user or tenant authorization (`src/publicapi.js:15`). A hostile expression becomes a cross-user boundary only when a host imports or displays one user’s content to another. No particular host deployment is assumed.

Expression text can enter through programmatic setters, writes, original element text or paste. Parsing rejects unknown commands and requires end-of-input before accepting a complete math write. Those checks establish syntactic recognition, not HTML encoding (`src/services/latex.js:43`, `src/services/latex.js:92`). TextPiece uses `document.createTextNode`, while TextBlock’s HTML representation concatenates `textContents()` into a span. Both facts matter: safety in an interactive insertion path does not establish safety when the same content is serialized and rendered again (`src/commands/text.js:68`, `src/commands/text.js:198`). This architectural distinction is not a validated exploit.

This fork adds per-controller grammar configuration. `options.commands` is transformed into command constructors, and `symbolDefinition.htmlEntity` becomes a VanillaSymbol rendering argument. Copying the grammar dictionary separates editor configuration, but does not make supplied HTML untrusted data. The host must own command definitions and callbacks (`src/services/commands.js:19`, `src/services/commands.js:69`, `src/services/commands.js:94`).

Clipboard settings change interpretation. `statelessClipboard` removes surrounding dollar delimiters or wraps pasted text in a text command. It is a format convention, not an escaping policy (`src/services/textarea.js:95`). `overrideLatexPaste` additionally selects typed-text insertion instead of LaTeX parsing; these are distinct paths to check, not interchangeable safety guarantees (`src/services/textarea.js:110`). Output returned by an HTML export also remains subject to the destination context’s rules; a host cannot treat an expression parser as a general HTML sanitizer.

A realistic attacker may control expression or clipboard content where the host permits it, or HTTP requests to an explicitly started reachable developer server. They are not assumed to control application scripts, trusted options, installed dependencies, build source or the developer account. The developer request handler reads files; the separate rebuild trigger uses local filesystem changes. This does not establish that a remote request supplies shell command text (`script/test_server.js:24`, `script/test_server.js:78`).

Host applications must enforce persistence permissions, cross-user sharing, output context, and input size/depth limits. The inspected parser/renderer runs in-process without an established workload-isolation boundary. Package metadata declares `private: true`; jQuery is required by the artifact but absent from declared dependencies, so actual resolution is an integration concern (`package.json:5`, `src/intro.js:1`). No external deployment configuration or current dependency compatibility was verified.

## 3. Attack Surface, Mitigations, and Attacker Stories

The following are prioritized hypotheses for future validation, not confirmed vulnerabilities. Each requires the stated starting capability and a concrete boundary failure; ordinary authorized editing is not an attack.

| Priority | Scenario and capability gain | Prerequisites | Impact | Existing controls | Mitigation | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| High, conditional | Expression text becomes active HTML through a render/serialization path | Attacker content rendered in another user’s page | Host-origin DOM alteration or script authority, if executable markup is reachable | Known-command parsing, full-input checks; some text paths use text nodes | Preserve text-as-data in every command renderer and verify round-trip paths | `src/services/latex.js:126`, `src/commands/text.js:68`, `src/commands/text.js:198` |
| High, conditional | Untrusted configuration supplies rendering HTML and gains host-origin DOM/script capability | Host accepts attacker-controlled `commands` definitions | Cross-user browser compromise if that configuration is rendered for others | Dictionary copies separate configuration but do not sanitize symbol HTML | Keep command definitions application-owned; constrain any declarative extension boundary | `src/services/commands.js:19`, `src/services/commands.js:94` |
| Medium, conditional | Deep or very large input monopolizes parsing/rendering | Host accepts unbounded supplied expressions | Editor freeze; broader UI unavailability in shared page | Syntax failure rejects invalid math, but no general workload budget is established | Host length/depth limits; isolate expensive processing if needed | `src/services/latex.js:62`, `src/services/latex.js:107` |
| Medium to High, conditional | Reachable development server exposes workspace files | Explicit server startup, network reachability and sensitive files under effective served location | Source or confidential file disclosure | OS read permissions; normalized request path | Restrict host binding and served workspace; do not expose developer tooling as a service | `script/test_server.js:9`, `script/test_server.js:24` |
| Context-dependent | Altered dependency/build input becomes shipped JavaScript | Attacker gains a lower-trust build-input channel | Consumers execute modified library code | Explicit build inputs and package main identify artifact path | Control dependency resolution and verify distributed artifacts | `package.json:4`, `Makefile:48` |

Validation should exercise actual host-supported input/render routes, including text serialization and paste options, before assigning exploitability. A syntactically accepted string is not proof of script execution; a malformed expression affecting only its author is not automatically a cross-user compromise. Developer exposure must be measured against the actual binding, workspace and network, rather than inferred from the existence of a script.

## 4. Severity Calibration (Critical, High, Medium, Low)

**Critical:** Requires extraordinary demonstrated reach, such as distribution compromise delivering attacker JavaScript across many privileged consuming applications. A malicious expression alone does not establish that reach. Repository or maintainer control already possessed by an attacker is not itself a new privilege gain.

**High:** A demonstrated cross-user expression-to-script boundary that executes with a victim’s meaningful application authority can qualify. Exposure of materially sensitive developer files may also qualify when the listener is actually reachable. Trusted application-supplied HTML and a developer intentionally opening their own file are counterexamples.

**Medium:** Reproducible hostile-input freezes affecting other users’ application use, or limited unintended disclosure from a reachable development workspace, can qualify. Large local expressions with only self-inflicted slowdown require lower calibration; absence of a generic size limit alone is not enough.

**Low:** Localized rendering corruption, recoverable editor errors, or narrowly scoped formatting defects without meaningful authority or availability loss. Pure semantic differences are not security findings unless a host relies on them for a security-relevant decision.

This is a source-backed architecture model, not completed audit coverage. It leaves actual host exposure, data sharing, dependency resolution and operational controls explicit rather than inventing them.

---

Repository: https://github.com/mathspace/msquill  
Version: `f393b3c26bb31ceed534d7980748b3bf9321aea3`
