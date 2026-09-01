# Split feature-parity audit

This audit compares the pre-existing Split product with the ordinary-web capabilities of Split-WebMCP. The Android project at `D:\AndroidStudioProjects\SplitLauncher2` was inspected read-only; no Android source was copied or modified.

## Classification

- **A — Already implemented properly** before this parity pass.
- **B — Missing but realistically implementable** in a normal web application; restored in this pass.
- **C — Requires web adaptation** because a website does not control an Android WebView or the browser itself.
- **D — Not legitimately reproducible** from an ordinary website because of platform and security boundaries.

| Original Split feature | Audit class | Final Split-WebMCP result |
| --- | --- | --- |
| Two simultaneous browser panes | A | Preserved as the dominant interface and authoritative workspace surface. Trusted local pages embed; external pages use an honest security-respecting fallback. |
| Movable/resizable split | A | Draggable 20/80-bounded divider with a saved ratio per T workspace. |
| Portrait and landscape support | A | Responsive top/bottom layout on narrow viewports and left/right layout on wide viewports. A website follows viewport shape rather than device-orientation APIs. |
| Tabs | A | T1–T4 retain two pane URLs, histories, preferences, privacy state, and split ratio. Humans switch them directly; WebMCP can inspect and now switch them. |
| Built-in notes | A | Shared persistent notes with human/agent provenance. |
| Bookmarks | A | Shared persistent bookmarks, visible and usable by both human and agent. |
| Browsing history | B | Pane-aware history already existed in state/back-forward controls; this pass restored the visible history panel, direct history jumps, and per-pane clearing. |
| Incognito browsing | C | Added **Private Split session** per T workspace. It prevents that workspace’s URLs/history from being written to Split local storage while enabled. It is explicitly not browser incognito and cannot hide traffic, cookies, browser history, or downloads. |
| Downloads | C | Trusted local resources use the standard HTML download behavior. External resources are handed to the browser in a new safe context; the server and browser decide whether to display or download. Split cannot force cross-origin downloads. |
| Ad blocking | D | Not claimed or simulated. An ordinary site cannot intercept another origin’s requests like Android WebView request interception or a browser extension. |
| Text-size controls | B | Added independent 75–150% visual zoom for each pane, saved with that T workspace and exposed to WebMCP. |
| Configurable homepage | B | Added a validated homepage for each pane, “use current page,” and a pane Home control. Preferences are exposed to WebMCP. |
| Search/URL navigation | A | Independent validated address/search input for each pane; unsafe schemes and credential-bearing URLs are rejected. |
| Copy/share | B | Added Clipboard API copy and Web Share API support with clipboard fallback. These require browser support and a user gesture. |
| Refresh | A | Each pane has an independent refresh control. |
| Clear cache/data | C | “Reset Split data” and per-pane history clearing affect only Split-owned local storage/state. A website cannot clear browser cache, cookies, history, or another site’s data. |
| Screenshot functionality | C | Added browser-authorized Display Capture. The user chooses a tab/window/screen in the browser prompt; Split saves the captured frame as PNG. A normal site cannot silently capture the screen or bypass permission. |

## Web security boundary

Split-WebMCP does not bypass iframe restrictions, CSP, X-Frame-Options, same-origin policy, user-permission prompts, or browser sandboxing. Web-adapted features are labeled according to what they actually do.
