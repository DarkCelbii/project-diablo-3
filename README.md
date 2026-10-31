# Project Diablo 3

An independent, early-stage server project created by **David Gibb**. The long-term
goal is a private server implementation for Diablo III.

## Status

Version 0.1.0 is a standalone local HTTP prototype: a realm description and
temporary character creation/listing. Diablo III client connectivity, gameplay,
and player accounts are future work. This prototype cannot run the game.

## Run locally

Requires Node.js 24 or newer. There are no third-party packages to install.

```sh
npm start
```

The service listens on `http://127.0.0.1:3000`. On startup it prints a randomly
generated development bearer token. Copy that token into your local API client;
it is valid only for this process. All characters disappear on restart.

You can supply your own token through `PD3_DEV_TOKEN` (32-256 letters, digits,
underscores or hyphens). `PORT` selects a port between 1 and 65535. Keep tokens
out of commits, screenshots, issues and application evidence.

### Try the API in PowerShell

In a second terminal, replace the placeholder with the token printed by your
server:

```powershell
$auth = @{ Authorization = 'Bearer PASTE_YOUR_LOCAL_TOKEN_HERE' }
Invoke-RestMethod http://127.0.0.1:3000/health
Invoke-RestMethod http://127.0.0.1:3000/api/realm
Invoke-RestMethod http://127.0.0.1:3000/api/characters -Method Post `
  -Headers $auth -ContentType 'application/json' `
  -Body '{"name":"Aidan","class":"wizard"}'
Invoke-RestMethod http://127.0.0.1:3000/api/characters -Headers $auth
```

| Method | Path | Purpose | Authentication |
| --- | --- | --- | --- |
| GET | `/health` | Service status | None |
| GET | `/api/realm` | Local realm and accepted class names | None |
| GET | `/api/characters` | List this development realm's characters | Bearer token |
| POST | `/api/characters` | Create a level-one character | Bearer token |

Creation accepts exactly `name` and `class`. Names are 3-16 ASCII letters,
digits or underscores, beginning with a letter. Names are unique regardless of
case; the realm is limited to 12 characters. Class identifiers are `barbarian`,
`crusader`, `demon-hunter`, `monk`, `necromancer`, `witch-doctor` and `wizard`.

## Test

```sh
npm test
```

Integration tests send real requests to temporary loopback servers. They cover
authentication, character creation, invalid input, duplicate names, body-size
limits (including chunked uploads), capacity, isolated server state, routing
and Host-header validation.

## Layout

```text
src/main.mjs                  Startup, configuration and shutdown
src/server.mjs                HTTP API and temporary character storage
test/server.test.mjs          HTTP integration tests
SECURITY.md                   Security contact and prototype limitations
docs/roadmap.md               Next development milestones
docs/application-evidence.md  Verification facts and missing evidence
```

## Library interface

Other development tools can import the realm implementation directly:

```js
import { createRealmServer, CLASSES } from 'project-diablo-3';
```

The public exports are `createRealmServer`, `CLASSES`, `MAX_BODY_BYTES` and
`MAX_CHARACTERS`. Consumers supply a development token and bind the returned
HTTP server to loopback. Each server has its own temporary character store.
The package can be installed from this Git repository at a pinned commit;
it has not been published to a package registry.

The companion [PD3 Scenario Runner](https://github.com/DarkCelbii/pd3-scenario-runner)
installs a pinned revision of this package and exercises a temporary realm with
JSON scenarios. Both projects are maintained by David Gibb. See the
[dependency evidence](docs/dependency-evidence.md) for the manifest, actual
import and verification results.

## Project contact

| Public name | Role |
| --- | --- |
| [David Gibb](https://github.com/DarkCelbii) | Creator and security maintainer |

See [SECURITY.md](SECURITY.md) for the security contact, implemented controls
and current reporting status.

## License

The original code and documentation in this repository use the [MIT License](LICENSE).
No game client, proprietary server files or game assets are included.

## Verification information

The [application evidence worksheet](docs/application-evidence.md) records the
information available for a verification application and the evidence still
needed. One first-party dependent development repository is documented. The
GitHub Dependents page showed 0 repositories and 0 packages when checked on
October 31, 2026. Independent adoption and application eligibility have not
been established.
