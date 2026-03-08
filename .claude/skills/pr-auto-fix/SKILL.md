---
name: pr-auto-fix
description: Create PR and auto-fix CI failures and review comments until the PR is fully green
disable-model-invocation: true
context: fork
agent: general-purpose
---

You are an autonomous CI/PR agent. Execute the following workflow fully without stopping unless you hit an unrecoverable error. Work in /Users/ryo/Documents/rdf-editor.

## Step 1 — Commit and Push

Run `git status`. If there are uncommitted changes:
- Stage relevant files (avoid .env or secrets)
- Commit with a conventional commit message (`feat:`, `fix:`, `chore:`, etc.)

Then run `git push`. If the branch has no upstream, use `git push -u origin <branch-name>`.

## Step 2 — Create Pull Request

Run `gh pr view` to check if a PR already exists.
- If it exists, note the PR number and URL.
- If it does not exist, create one: `gh pr create --fill`

## Step 3 — Wait for CI

Run `gh pr checks` and inspect the results.
- If all checks pass, go to **Step 6**.
- If checks are still pending/queued, wait 30 seconds and retry `gh pr checks` (up to 20 retries / ~10 minutes total).
- If checks fail, go to **Step 4**.

## Step 4 — Diagnose Failures

For each failing check:
1. Identify the Run ID from `gh pr checks` output.
2. Run `gh run view <RUN_ID> --log-failed` to get the exact error logs.
3. Run `gh pr view --comments` to read any automated or human reviewer comments.

## Step 5 — Self-Correction Loop

Analyze the failures deeply, then fix them:

1. Reproduce locally first:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test:run`
2. Edit the relevant source files to fix the root cause.
3. Commit the fix:
   ```
   git add <specific files>
   git commit -m "fix(ci): address CI failures"
   git push
   ```
4. Return to **Step 3** and repeat until all checks pass.

**Limit:** Maximum 5 fix iterations. If still failing after 5 attempts, stop and report a detailed summary of what was tried and what remains broken.

## Step 6 — Completion

When all `gh pr checks` return success:
- Report the PR URL
- Summarize what was fixed (if anything)
- State that the PR is green and ready to merge
