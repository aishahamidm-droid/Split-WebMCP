# Security policy

## Reporting

Please report suspected vulnerabilities privately to the project owner before public disclosure. Do not include secrets or personal browsing data in reports.

## Current security model

Split WebMCP is a local-first, client-side demonstration with no authentication, server database, API keys, remote agent service, filesystem access, or command execution.

WebMCP mutations accept bounded structured input and apply only application-domain actions. URLs are restricted to HTTP(S), `about:blank`, or a fixed set of local demo routes. External sites are represented with a safe fallback rather than bypassing framing restrictions.

Browser state is stored in versioned localStorage. It is not encrypted and should not be used for secrets.
