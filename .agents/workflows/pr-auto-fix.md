---
description: Create PR and auto-fix CI failures and review comments
---
# PR Auto-Fix Workflow

This workflow empowers the agent to automate the creation of a Pull Request, check CI status, and self-correct any failing tests or code review comments until the PR is fully green and ready to merge.

## Steps

1. **Commit and Push (if not already done)**
   - Run `git status`. If there are uncommitted changes, add them and commit with an appropriate conventional commit message.
   - Push the branch to the remote repository. If the branch doesn't exist on remote, use `git push -u origin <branch-name>`.

2. **Create Pull Request**
   - Run `gh pr view` to see if a PR already exists.
   - If it does not exist, create one using `gh pr create --fill` or with explicitly defined title and body.

3. **Check Status and Wait for CI**
   - Run `gh pr checks` to check the GitHub Actions CI status.
   - Take note of any failing or pending checks.

4. **Review Failures and Comments**
   - If `gh pr checks` reports failures, identify the failing Run ID and use `gh run view <RUN_ID> --log-failed` to retrieve the exact error logs of the failed jobs.
   - Run `gh pr view --comments` to read any automated code scanning alerts, linter comments, or human reviewer feedback.

5. **Self-Correction Loop**
   - **IF** any CI check failed OR there are actionable review comments:
     - Analyze the logs/comments to deeply understand the issue.
     - Run local checks first (e.g. `npm run typecheck`, `npm run lint`, `npm run test`) to reproduce and verify fixes locally.
     - Use file editing tools to fix the code.
     - Commit the fix (`git add . && git commit -m "fix(ci): address review and CI feedback"`) and push (`git push`).
     - Return to **Step 3** and repeat the validation process until all checks pass.

6. **Completion**
   - **IF** `gh pr checks` returns all successful/green results, AND all actionable review comments have been addressed:
     - Notify the user that the PR is completely green and ready to be merged.
