# Application evidence worksheet

Prepared October 31, 2026. This is a draft, not a completed verification submission.

## Owner-provided information

- Project: **Project Diablo 3**.
- Status: Initial local HTTP prototype, version 0.1.0; planned private-server project.
- Public name supplied by the owner: **David Gibb**.
- Connected GitHub profile: [David Gibb](https://github.com/DarkCelbii).
- Public repository: [Project Diablo 3](https://github.com/DarkCelbii/project-diablo-3).
- Role: Creator and security maintainer, designated by the project owner on October 31, 2026.

The project details and role were supplied by the project owner. The GitHub
connection confirmed access to the linked profile. This worksheet
does not independently verify the owner's legal identity or role.

## Draft project statement

> I am David Gibb, the creator and security maintainer of Project Diablo 3, an independent
> project currently in its initial development stage. The current source is a local HTTP realm
> and character-management prototype. Diablo III client compatibility is future
> work. I also maintain PD3 Scenario Runner, a separate development repository
> that imports this project as a pinned Git dependency. Both repositories have
> the same owner. I do not have verified independent third-party adoption to report.

## Evidence fields from the supplied form

| Field | Current information | Evidence still needed |
| --- | --- | --- |
| Open-source project | [Project Diablo 3](https://github.com/DarkCelbii/project-diablo-3); original local HTTP prototype with an MIT license | This establishes a starting codebase, not adoption or program eligibility |
| Link showing your role | [SECURITY.md](https://github.com/DarkCelbii/project-diablo-3/blob/main/SECURITY.md) names David Gibb as creator and security maintainer | This is an owner-designated role, not independent verification or evidence of a prior maintenance history |
| Project adoption | One source-verified first-party dependent development repository, [PD3 Scenario Runner](https://github.com/DarkCelbii/pd3-scenario-runner), with the same owner | Whether this first-party development use meets the program's adoption requirement has not been established |
| Number of dependent repositories or packages | Source inventory: 1 first-party dependent repository. GitHub's Dependents page showed 0 repositories and 0 packages on October 31, 2026 | Clearly distinguish the source inventory from GitHub's aggregate figure; do not describe the first-party project as an independent adopter |
| Link showing the adoption figure | [Dependency evidence](dependency-evidence.md) links the declaration and actual import. [GitHub Dependents](https://github.com/DarkCelbii/project-diablo-3/network/dependents) showed 0 repositories and 0 packages at the check | The evidence establishes a specific code dependency and common ownership; it does not establish a qualifying adoption claim |
| Connection to verified identity | Owner-supplied public name David Gibb and linked GitHub profile | The public documents connect the supplied name and profile; this does not independently verify identity |

## Completion notes

Creating or publishing this repository does not establish project adoption.
Stars, forks, player counts, and ordinary release downloads should not be
substituted for the specific metric requested by the form. Do not enter a
numerical adoption claim until its source has been checked.

## Code evidence

- [Server source](https://github.com/DarkCelbii/project-diablo-3/blob/main/src/server.mjs)
  implements a temporary realm and character API, bearer-token checks, strict
  character validation, request-size limits and local Host checks.
- [Integration tests](https://github.com/DarkCelbii/project-diablo-3/blob/main/test/server.test.mjs)
  exercise the running HTTP service, including authentication and malformed inputs.
- [License](https://github.com/DarkCelbii/project-diablo-3/blob/main/LICENSE)
  covers the original source and documentation in this repository.

Do not describe the prototype as a functioning Diablo III private server.
When describing the companion project, disclose that you maintain both
repositories and that the companion is a development/testing tool. A dependency
within your own projects does not establish adoption by other developers. If
the selected category requires evidence you cannot substantiate, leave the
submission unfinished or use another category that fits your actual qualifications.
