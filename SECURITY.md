# Security

## Security contact

**[David Gibb](https://github.com/DarkCelbii)** is the project's
**creator and security maintainer**, designated by the project
owner on October 31, 2026. This is a current project role; it does not claim a
prior maintenance history or an independent security audit.

The maintainer is the contact for vulnerability triage, security fixes, changes
to authentication and input validation, and future security reporting policy.

## Reporting status

A private vulnerability reporting channel has not yet been configured for this
new repository. Reporting instructions should be added before public releases.
Do not include passwords, tokens, personal data, or undisclosed vulnerability
details in public issues.

## Prototype controls

- The CLI binds to `127.0.0.1` and accepts only matching local Host headers.
- Character reads and writes require a development bearer token.
- Generated tokens use 32 random bytes; configured tokens must pass validation.
- Token hashes are compared with a timing-safe comparison.
- JSON bodies are limited to 4096 bytes, including chunked requests.
- Character fields and names are validated; identifiers, level and timestamps
  are assigned by the server.
- Each process is limited to 12 characters. HTTP header sizes and request
  timeouts are bounded.
- Error responses omit internal stack traces. Responses disable caching.

## Current limits

Version 0.1.0 is for one developer's local experiments. Its shared token is not
a player-account or per-user authorization system. Character data is in memory
and disappears on restart. It has no TLS termination, persistent database,
multi-user isolation or Diablo III protocol implementation. Do not deploy this
prototype as an internet-facing game service.

The generated development token is printed once to the local console. Avoid
sharing console output containing it. Supplying `PD3_DEV_TOKEN` prevents the
application from printing that token. No token is written to a repository file.

## Version status

The 0.1.0 prototype is under initial development. There are no production
releases or support commitments. Implemented controls have integration tests;
they have not undergone an independent audit.
