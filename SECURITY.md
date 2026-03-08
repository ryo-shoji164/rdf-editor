# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it through GitHub's private vulnerability reporting feature:

**[Report a vulnerability](https://github.com/ryo-shoji164/rdf-editor/security/advisories/new)**

Please do not open a public GitHub issue for security vulnerabilities, as this may expose the issue before a fix is available.

### What to include in your report

- A clear description of the vulnerability
- Steps to reproduce the issue
- The potential impact of the vulnerability
- Any suggested mitigations or fixes (optional)

## Response Timeline

| Stage | Target |
|---|---|
| Acknowledgement | Within 7 days of report |
| Status update | Within 14 days of report |
| Fix for critical vulnerabilities | Within 30 days of report |
| Fix for high/medium vulnerabilities | Within 60 days of report |

We will keep you informed of progress throughout the process.

## Scope

### In scope

- Security vulnerabilities in the rdf-editor web application itself
- XSS, injection, or data-leakage issues in the client-side code
- Vulnerabilities introduced by direct dependencies (npm packages listed in `package.json`)
- Security misconfigurations in GitHub Actions workflows

### Out of scope

- The content of RDF data that users choose to load or edit — users are responsible for the data they process
- Third-party SPARQL endpoints that users connect to via the application
- Vulnerabilities in infrastructure or hosting environments not controlled by this project
- Social engineering attacks
- Issues affecting only browsers that are no longer supported

## Disclosure Policy

Once a fix is released, we will publish a GitHub Security Advisory summarizing the vulnerability, its impact, and the fix. Credit will be given to the reporter unless they prefer to remain anonymous.

## No Bug Bounty

This is an open-source project maintained on a volunteer basis. We are unable to offer financial compensation for vulnerability reports. We sincerely appreciate the effort of security researchers who help keep this project safe.
