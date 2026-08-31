# Split WebMCP

**Two browsers. One shared workspace. Human + Agent.**

Split WebMCP is a new web implementation of the pre-existing Split dual-browser concept, created for the WebMCP Challenge. A human browses with two independent panes on one screen. An external WebMCP-capable agent can discover structured tools, understand the same T1–T4 workspace, and safely update the exact state visible to the human.

This repository contains only the new web implementation. It does not contain or copy the Android application source.

## Problem

Conventional browsing forces people to repeatedly replace, switch, and reconstruct context. The original Android Split app addressed that for a human by keeping two independent browser panes visible. But an external agent still had to infer state from pixels and simulate clicks.

Split WebMCP extends the product with a structured collaboration contract. The agent can read pane URLs and saved workspaces, open a validated resource in a chosen pane, add a note, save a bookmark, or attach a structured comparison. Those operations update the same reducer-backed state used by the normal interface.

## Why WebMCP

Split already has a natural capability boundary: panes, navigation, saved two-page workspaces, notes, and bookmarks. WebMCP makes those capabilities discoverable and typed without adding a fake in-product agent.

The interaction is:

```text
External WebMCP-capable agent
        ↓ discovers registered tools
document.modelContext.registerTool(...)
        ↓ invokes validated Split operations
Shared reducer-backed Split workspace state
        ↓
Visible browser panes, notes, bookmarks, comparisons, and activity
```

This is stronger than visual click automation because the agent receives stable names, descriptions, JSON Schemas, structured results, and explicit state. It is also better for the human: agent actions are immediately visible and labeled with agent provenance.

WebMCP references used by the implementation:

- [Current WebMCP Community Group draft](https://webmachinelearning.github.io/webmcp/)
- [WebMCP explainer and imperative API examples](https://github.com/webmachinelearning/webmcp)
- [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/agents)

## Product experience

- Two independent browser panes with separate address/search, back, forward, refresh, bookmark, title, and history state.
- Responsive split: left/right on wider screens and top/bottom on narrow screens.
- Draggable divider with a split ratio saved separately for each workspace.
- Four saved paired-browser workspaces: T1, T2, T3, and T4.
- Same-origin local demo pages rendered as real pages inside sandboxed iframes.
- Honest external-resource fallback when reliable third-party embedding cannot be guaranteed; no CSP or X-Frame-Options bypass.
- Draggable quick-tools control for notes, bookmarks, optional comparisons, and human/agent activity.
- Local browser persistence with a reset control and safe malformed-state fallback.
- WebMCP feature detection; the complete human interface works without WebMCP.
- Responsive, keyboard-accessible controls, labeled panes, useful blank states, and inline validation errors.

## Architecture

The Vinext/React interface is deliberately client-local and API-key-free.

```text
Human UI events ─────┐
                    ├─→ splitReducer() ─→ SplitState ─→ UI render
WebMCP execute() ────┘                         └──────→ localStorage
```

- `components/split-app.tsx` renders the dual browser and dispatches normal human actions.
- `lib/split-state.ts` defines the authoritative state, T1–T4 behavior, navigation history, reducer, and persistence.
- `lib/validation.ts` validates URLs, text, panes, tabs, and comparison rows.
- `lib/webmcp.ts` registers tools that dispatch the same reducer actions.
- `app/demo/*` contains deterministic, same-origin browsing content for a reliable judge demo.

There is no built-in AI simulation. The compact status badge only reports whether the real browser API is available and how many tools registered.

## WebMCP tools

All tools are registered with `document.modelContext.registerTool(tool, { signal })`. An `AbortController` owns the registration lifecycle.

| Tool | Purpose | Main inputs | Visible/shared effect |
| --- | --- | --- | --- |
| `get_workspace` | Read the complete Split state | none | Read-only structured context |
| `get_panes` | Read both currently visible browser panes | none | Read-only pane URLs, titles, history, ratio |
| `get_tabs` | Read T1–T4 paired workspaces | none | Read-only tab/pane state |
| `open_resource` | Open a safe URL or approved demo page | `url`, `pane`, optional `tabId`, `title` | Navigates that human-visible pane and records agent activity |
| `get_notes` | Read shared notes | none | Read-only notes with provenance |
| `add_note` | Add a shared note | `body`, optional `title` | Note appears in quick tools as an agent note |
| `get_bookmarks` | Read saved resources | none | Read-only bookmarks |
| `save_bookmark` | Save a URL or visible pane | `pane`, optional `url`, `title` | Bookmark appears in quick tools with agent provenance |
| `create_comparison` | Attach a structured comparison to visible pages | `title`, `summary`, `rows[]` | Comparison appears as supporting workspace material |

Schemas use `additionalProperties: false`, bounded strings and arrays, enums for pane/tab choices, and runtime validation inside every mutation handler. Browser schema validation is not treated as the only security boundary.

## Local setup

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server (normally `http://localhost:3000`). No API key, account, database, or external service is required.

## Test without WebMCP

1. Open T1 and verify the local welcome and WebMCP guide pages appear simultaneously.
2. Enter a domain or search query in either pane.
3. Use independent back/forward navigation.
4. Drag the divider, switch to T2, then return to T1 to verify per-tab state.
5. Drag/click the floating wrench and add a note or bookmark.
6. Reload and confirm the local workspace restores.
7. Reset the demo with the reset control.

When `document.modelContext` is unavailable, the header reports **Human mode**. This is a real fallback, not a WebMCP simulation.

## Test with WebMCP

Use a browser/build with WebMCP enabled and open Split at a secure origin (or the supported local development origin).

In the browser console, feature detection is:

```js
typeof document.modelContext?.registerTool === 'function'
```

The header should report **9 WebMCP tools**. A capable external agent should discover the tool descriptions and JSON Schemas. The current draft also defines `getTools()` and `executeTool()` for supported in-page testing contexts; browser-provided agent tooling may expose its own inspector.

## Demo workflow

1. Human opens T1 with two local demo pages visible.
2. Human navigates one pane or switches to T2.
3. Human asks an external WebMCP agent to inspect the Split workspace.
4. Agent calls `get_workspace` or `get_panes`.
5. Agent calls `open_resource` for a selected pane, then `add_note`, `save_bookmark`, or `create_comparison`.
6. Split updates the same pane/tool panel immediately and labels the activity as **Agent**.
7. Human continues navigating or editing without leaving the dual-browser workspace.

The local pages avoid third-party availability and embedding failures during the core demo. An external URL intentionally demonstrates the honest fallback card.

## Security considerations

- Only `http:`, `https:`, `about:blank`, and a fixed allowlist of local demo paths are accepted as resources.
- `javascript:`, `data:`, `file:`, credential-bearing URLs, malformed URLs, and unknown demo routes are rejected.
- Plain searches are encoded into a fixed HTTPS DuckDuckGo URL.
- External resources are never fetched by application code or forced into iframes.
- Only trusted same-origin demo pages are embedded, with an iframe sandbox.
- External links use `noopener` and `noreferrer`.
- Text is rendered by React; no WebMCP input enters `innerHTML`.
- Tool schemas and handlers bound string/array sizes and reject unexpected shapes.
- No arbitrary JavaScript, filesystem, shell, command, credential, or secret capability exists.
- State is local to the current browser through versioned `localStorage`; malformed or unavailable storage falls back safely.
- Security headers are prepared in `public/_headers`, including CSP, MIME sniffing prevention, a strict referrer policy, same-origin framing, and restrictive permissions policy.
- Tool registrations are cleaned up through `AbortSignal`.

## Tests and checks

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm audit
```

Automated tests cover pane navigation/history isolation, T1–T4 split persistence, notes/bookmark provenance, persistence fallback, URL/search validation, unsafe schemes, malformed comparison input, WebMCP feature fallback, registration lifecycle, exact tool names, and agent actions changing the shared visible state.

Actual local results are recorded in the final development report; this README does not claim checks that have not run.

## Pre-existing Split disclosure

The original Split concept and Android application existed before the WebMCP Challenge. Its dual-browser concept, two-pane browsing, T1–T4 saved paired workspaces, URL navigation, independent back/forward controls, draggable resizing, portrait/landscape layouts, built-in notes, quick tools, palettes, dark mode, and other Android behavior are pre-existing work.

The Android repository at `D:\AndroidStudioProjects\SplitLauncher2` was inspected only as a read-only product reference. Its source was not copied into this project, modified, formatted, upgraded, committed, or included here.

See [Original Split and new-work disclosure](docs/ORIGINAL-SPLIT-DISCLOSURE.md) for the explicit before/after boundary.

## Exact new work created for this hackathon

- The separate Split WebMCP web application and responsive browser-like interface.
- A web-native T1–T4 state model with two panes, per-pane history, per-tab split ratios, persistence, and deterministic demo pages.
- Real `document.modelContext.registerTool(...)` integration with nine structured capabilities.
- Shared human/WebMCP reducer state and visible agent provenance.
- Web-specific URL/schema validation, iframe/fallback policy, security headers, and feature detection.
- WebMCP-focused automated tests, documentation, social preview, open-source preparation, and deployment configuration.

No claim is made that the original Split idea or its Android functionality was created for this challenge.

## License

[MIT](LICENSE). MIT is a recognized permissive open-source license that makes judging, reuse, modification, and distribution straightforward while preserving copyright and warranty terms.

## Deployment (later, only after approval)

The project is compatible with the generated Sites/Vinext Cloudflare Worker configuration. Before deployment:

1. Set `NEXT_PUBLIC_SITE_URL` to the trusted final HTTPS origin so social metadata resolves correctly.
2. Re-run all tests, type checks, lint, production build, and dependency audit.
3. Verify the security headers at the live origin.
4. Test all nine registrations and at least one mutation in a real WebMCP-enabled browser.
5. Publish only after the project owner explicitly approves GitHub creation and deployment.

No remote, deployment, or public resource is created by the local setup.
