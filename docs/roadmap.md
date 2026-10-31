# Development roadmap

## Initial prototype

- [x] Loopback HTTP service and health endpoint.
- [x] Local realm description and supported class identifiers.
- [x] Temporary character creation and listing with a development bearer token.
- [x] Input limits, bounded storage and HTTP integration tests.

## Next milestones

1. Define requirements for player identities, character ownership, data storage
   and threat boundaries. Add a database with migrations and restart/recovery tests.
2. Implement real account authentication and per-account authorization before
   allowing multiple users. Establish a private vulnerability reporting channel.
3. Design and test a transport/protocol layer independently from the realm model.
   Client compatibility and gameplay require separate research and implementation.

All future milestones are planned work. No client compatibility, user adoption,
external security review or production readiness is claimed.
