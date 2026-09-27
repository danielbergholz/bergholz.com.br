#!/usr/bin/env bash
set -euo pipefail

# Runs on every new session (SessionStart "startup"). Must be safe to run
# repeatedly and must not rewrite unpushed commits on an existing branch.

# Sync the main ref. Non-fatal: offline starts should still install deps.
git fetch origin main || echo "warning: git fetch failed, continuing offline"

branch="$(git rev-parse --abbrev-ref HEAD)"

if ! git rev-parse --verify origin/main >/dev/null 2>&1; then
  echo "No origin/main ref — skipping git sync"
elif [ "$branch" = "main" ]; then
  echo "On main — fast-forwarding to origin/main"
  git merge --ff-only origin/main
elif [ "$(git rev-list --count origin/main..HEAD)" = "0" ]; then
  echo "Fresh branch '$branch' — rebasing onto origin/main"
  git rebase origin/main
else
  echo "Branch '$branch' has local commits — leaving history alone"
fi

# Install fresh every session. npm ci is deterministic
# (clean install straight from the lockfile) and safe to run repeatedly.
echo "Installing dependencies (npm ci)"
npm ci
