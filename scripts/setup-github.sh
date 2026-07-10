#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-ai-agent-upside-hubs}"
OWNER="${2:-timparsa}"

echo "→ Checking gh auth…"
gh auth status

echo "→ Creating GitHub repo ${OWNER}/${REPO} (if needed)…"
gh repo view "${OWNER}/${REPO}" 2>/dev/null || \
  gh repo create "${OWNER}/${REPO}" --public --source=. --remote=origin --push

echo "→ Setting origin and pushing…"
git remote set-url origin "git@github.com:${OWNER}/${REPO}.git"
git push -u origin main

echo "✓ Pushed to https://github.com/${OWNER}/${REPO}"
