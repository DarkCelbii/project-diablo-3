# First-party dependency evidence

Checked October 31, 2026.

## Identified dependent repository

[PD3 Scenario Runner](https://github.com/DarkCelbii/pd3-scenario-runner) is a
separate development tool maintained by **David Gibb (celbii / DarkCelbii)**,
who also owns Project Diablo 3. Its purpose is to run repeatable HTTP scenarios
against an isolated, temporary realm using this project's actual implementation.

The dependency is visible in the published source:

- [package.json](https://github.com/DarkCelbii/pd3-scenario-runner/blob/d17099968a0d2a6b9c814d0475fc4876e5f90f7c/package.json)
  declares `project-diablo-3` as a Git dependency pinned to core commit
  `ad090efbed935dea0d7636b69405d6311a4c46bf`.
- [package-lock.json](https://github.com/DarkCelbii/pd3-scenario-runner/blob/d17099968a0d2a6b9c814d0475fc4876e5f90f7c/package-lock.json)
  records the resolved dependency.
- [src/runner.mjs](https://github.com/DarkCelbii/pd3-scenario-runner/blob/d17099968a0d2a6b9c814d0475fc4876e5f90f7c/src/runner.mjs)
  imports `createRealmServer` and `MAX_CHARACTERS` from the installed package,
  starts the server and sends real HTTP requests to it.

## Verification performed

- The core's 11 HTTP integration tests passed after adding the package interface.
- The runner installed the pinned Git dependency with install scripts disabled.
- The runner's 7 tests passed against that installed dependency.
- A clean `npm ci --ignore-scripts` installation completed; the example then
  passed all 8 checks against a temporary local realm.
- The scenario report omitted the internally generated bearer token.

## How to describe the relationship

An accurate description is: **One first-party dependent development repository,
also maintained by me.** This count is an inventory of the specific source
dependency above; it is not a claim of independent third-party adoption.

The [GitHub Dependents page](https://github.com/DarkCelbii/project-diablo-3/network/dependents)
showed **0 repositories and 0 packages** when checked after publication on
October 31, 2026. The reason it had not listed this dependency was not determined.
Do not present the source inventory as GitHub's reported aggregate count.

Whether a program accepts first-party development dependencies as adoption
evidence depends on its criteria. This document does not establish eligibility.
