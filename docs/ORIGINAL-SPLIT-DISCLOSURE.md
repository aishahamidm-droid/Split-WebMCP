# Original Split and new-work disclosure

## Before the WebMCP Challenge

Split already existed as an Android dual-browser productivity application. The product concept and Android implementation are pre-existing work, including the core experience of keeping two web pages visible, resizing the split, switching orientation, retaining paired T1–T4 workspaces, navigating each pane, and using notes and quick tools.

The original Android application remains in a separate local repository outside this web project.

That repository was used only as a **read-only product reference**. No file in it was edited, formatted, upgraded, renamed, moved, deleted, committed, or copied wholesale into Split WebMCP.

## New during the WebMCP Challenge

Split WebMCP is a separate, independently implemented web project and Git history.

New challenge work consists of:

1. A responsive web implementation that preserves Split’s browser-first two-pane interaction model.
2. Real browser-native WebMCP registration through `document.modelContext.registerTool(...)`.
3. A coherent agent capability surface for reading and changing the same panes, T1–T4 workspaces, notes, bookmarks, and supporting comparisons visible to a human.
4. A shared authoritative reducer and persistent web workspace state for human and agent operations.
5. Human/agent provenance and visible activity evidence.
6. Web-specific runtime/schema validation, safe URL handling, security-respecting embed fallback, security headers, and WebMCP feature detection.
7. Deterministic same-origin demo web pages, automated tests, open-source documentation, and web deployment preparation.

The hackathon claim is the meaningful WebMCP extension and the new web implementation—not the original Split concept or Android functionality.
