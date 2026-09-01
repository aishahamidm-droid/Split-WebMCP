# Actual SplitLauncher2 feature-parity audit

This inventory is based on a read-only inspection of the separately provided Android checkout, including its manifest, portrait/landscape layouts, `DualBrowserActivity`, dormant `MainActivity`, resources, dialogs, quick menu, WebView configuration, and preference writes. No Android file was modified or copied.

## Reachable screens and controls

The manifest launches `DualBrowserActivity`. `MainActivity` contains an installed-app selector prototype, but it is not registered as a launcher activity and is not part of the reachable current UI.

| Android screen/control | Actual behavior | Split-WebMCP parity |
| --- | --- | --- |
| Portrait dual browser | Top and bottom WebViews, independent URL fields and back/forward controls | Responsive top/bottom web panes |
| Landscape dual browser | Left and right WebViews with the same independent controls | Responsive left/right web panes |
| T1–T4 buttons | Each persists two URLs and split ratio; last selected T workspace persists | Implemented; shared with WebMCP |
| Split handle | Draggable between 20/80 bounds; ratio persists per T workspace | Implemented |
| Movable quick-tools wrench | Expands/collapses tools; x/y position persists | Implemented with web-safe right/bottom position persistence |
| Notepad quick action | Chooses popup, first pane, or second pane | Quick Tools panel plus shared in-pane Notepad route for either pane |
| Notes popup/editor | Lists notes; creates and edits titled notes; persists JSON | Shared persistent notes with human/agent provenance; creation in panel or pane |
| Watch quick action | Netflix, Prime Video, Crunchyroll, YouTube; then choose pane | Restored with the same services and pane choice |
| Palette quick action | Nine palettes plus Light/Dark toggle | Restored in discoverable Settings |
| System Back | Tries second WebView history, then first, then exits | Browser-app controls remain pane-specific; the containing browser owns system Back |

## Every setting and persisted preference found

There is no separate Android Settings activity. User settings and tools are accessed by tapping the movable wrench and then the Palette, Watch, or Notepad icon.

| Setting/preference | Choices or value | Persistence |
| --- | --- | --- |
| Palette | Ocean, Forest, Graphite, Rose, Indigo, Ruby, Amber, Mint, Blue | `palette_name` in Android SharedPreferences |
| Display mode | Light mode / Dark mode | `dark_mode` in SharedPreferences |
| T workspace | Last active T1–T4 | `last_tab` |
| Paired workspace URLs | First and second URL for every T workspace | `${tab}_top` and `${tab}_bottom` |
| Split ratio | 20–80% ratio for every T workspace | `${tab}_split` |
| Quick-tools position | Draggable x/y coordinates | `quick_x` and `quick_y` |
| Notes | Array of title/body records | `notes_json` |

## Exact Android palette behavior

The nine palette primaries are Ocean `#14747C`, Forest `#267052`, Graphite `#475569`, Rose `#AF4863`, Indigo `#4F46E5`, Ruby `#BE3044`, Amber `#B46318`, Mint `#0D9488`, and Blue `#2563EB`.

The chosen palette recolors the Android content/browser backgrounds, divider handle, URL text, URL hints, input underline, back/forward buttons, quick-action buttons, and active/inactive T1–T4 buttons. Dark mode retains the selected primary while replacing background, text, hint, input-line, inactive-button, and handle colors with dark equivalents.

Split-WebMCP mirrors that scope across the actual web interface: workspace background, header identity, T1–T4 states, pane chrome and URL inputs, browser controls, divider, footer, quick tools, Settings surfaces, and primary actions. Palette name, dark mode, and quick-tool position persist inside the authoritative Split state.

## Features missed by the previous audit

| Missed original feature | Final handling |
| --- | --- |
| Nine named color palettes | Restored coherently and persisted |
| Light/Dark mode inside Palette | Restored and persisted |
| Watch shortcuts with pane choice | Restored |
| Notepad placement in either browsing pane | Restored through a trusted same-origin Notepad that reads/writes the shared notes state |
| Persisted draggable quick-menu position | Restored |
| Popup navigation kept inside the originating WebView | Ordinary sites cannot control third-party popup policy; trusted resources stay pane-aware and external links use safe browser behavior |
| Intent URL web fallback | Split-WebMCP accepts only validated HTTP/HTTPS, approved local routes, and `about:blank`; it does not launch Android intents |
| TikTok-specific injected scroll workaround | Not reproduced: same-origin policy and CSP prevent an ordinary site from injecting fixes into third-party pages |

## WebView configuration that is not a user setting

The Android activity enables JavaScript/DOM storage/database storage, images, multiple windows, mixed-content compatibility, third-party cookies, geolocation, autoplay, automatic permission grants, desktop-like user-agent adjustments, and orientation-specific zoom. An ordinary web application cannot safely or legitimately override those browser-wide policies. Split-WebMCP leaves permissions, cookies, mixed content, popups, autoplay, user agent, and cross-origin execution under browser control.

## Earlier summarized features not found in this checkout

The inspected source does not contain user-facing implementations for bookmarks, incognito, downloads, ad blocking, configurable homepage, copy/share, refresh, cache/data clearing, or screenshots. Some exist in Split-WebMCP as independently implemented web extensions, but this audit does not attribute them to the inspected Android checkout.

## Classification

- **A:** dual panes, responsive orientation, T1–T4, resizing, URL navigation, back/forward, persisted workspace state, notes.
- **B:** palette/dark mode, Watch shortcuts, in-pane Notepad, and persisted quick-tool position were missing from the web version and are now restored.
- **C:** popup routing, intent fallback, system Back, and WebView permissions require honest browser-controlled adaptations.
- **D:** cross-origin script injection and WebView-level policy overrides cannot legitimately be reproduced by an ordinary website.
