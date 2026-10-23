# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please do **not** open a public issue.

Send a private report to [pawelgawlik.dev@gmail.com](mailto:pawelgawlik.dev@gmail.com) with details of the issue.

You should receive a response within 48 hours. If not, please follow up.

## Scope

- The ChessRoot application (Angular client)
- Build and deployment pipelines
- OAuth handling with Lichess and Chess.com

## What to include

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

## Repository and deployment controls

- Workflows only execute jobs when both the event actor and rerun actor are `PawelGawlikDev`.
  CI runs on pushes to `master` or manual dispatch, not external pull requests. GitHub can still record
  a skipped workflow run for an unauthorized event; this does not execute its jobs.
- Workflow tokens are read-only, and checkout does not persist credentials in the working tree.
- The live `Release tags - owner-admin only` ruleset restricts creation, updates, and deletion of
  `v*` tags to repository admins. Currently `PawelGawlikDev` is the only collaborator/admin; review
  this restriction before granting another account admin access.
- The live `production` environment requires approval from `PawelGawlikDev`, disallows admin bypass,
  and permits deployments only from `v*` tags. Self-approval is allowed for this solo-maintained project.
  The `development` environment also permits only `v*` tags.
- GitHub requires approval for all external fork contributors. Do not approve untrusted workflows.
  The workflow-file changes must be pushed before their job guards and environment references apply.

## Sentry and Cloudflare credentials

- The browser Sentry DSN is public, write-only ingestion configuration, not an administrative token.
  It can be copied to submit fake events. Client-side checks cannot completely prevent this.
- Store upload/deployment tokens only in GitHub Actions secrets or ignored local files. `.env`,
  `.env.*`, `.dev.vars*`, and `.sentryclirc` are ignored; example files must contain no real credentials.
- Use a Sentry upload token with `org:ci` scoped to the intended organization. Do not give the CI
  upload token project-administration permissions just to change settings.
- Use a Cloudflare API token scoped to the deployment account and only the permissions needed by
  the Workers deployment. Do not use a Global API Key or an all-accounts token. GitHub secrets cannot
  be read back to audit an existing token; review its permissions in the Cloudflare dashboard.

### Account-level follow-up

The local Sentry upload credential returns HTTP 403 for project settings, and the connected MCP tools
do not expose allowed-domain or billing-notification settings. These remain dashboard actions for an
authorized administrator:

1. Restrict Sentry allowed domains to `chessroot.org` and the exact development hostname(s) you use.
   Avoid allowing every `workers.dev` subdomain. Domain restrictions are not proof against forged events.
2. Enable Sentry usage/budget notifications for the account owner. The ingestion cap was intentionally
   left unchanged at the maintainer's request.
3. Verify the existing Cloudflare deployment token's account and permissions; replace the GitHub secret
   only if narrowing the token is necessary. No tokens were rotated by this change.
