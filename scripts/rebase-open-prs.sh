#!/usr/bin/env bash
set -euo pipefail

REMOTE="${1:-origin}"
MAIN_BRANCH="${MAIN_BRANCH:-main}"

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Remote '$REMOTE' is not configured." >&2
  exit 1
fi

echo "Fetching $REMOTE/$MAIN_BRANCH, branch heads, and open PR refs..."
git fetch "$REMOTE" \
  "+refs/heads/*:refs/remotes/$REMOTE/*" \
  "+refs/pull/*/head:refs/remotes/$REMOTE/pr-head/*" \
  "+refs/pull/*/merge:refs/remotes/$REMOTE/pr-merge/*"

mapfile -t OPEN_PR_NUMBERS < <(
  git for-each-ref --format='%(refname:short)' "refs/remotes/$REMOTE/pr-merge" \
  | awk -F'/' '{print $NF}' \
  | sort -n
)

if [ "${#OPEN_PR_NUMBERS[@]}" -eq 0 ]; then
  echo "No open PR merge refs found."
  exit 0
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"
trap 'git checkout -q "$current_branch" >/dev/null 2>&1 || true' EXIT

for pr in "${OPEN_PR_NUMBERS[@]}"; do
  head_ref="refs/remotes/$REMOTE/pr-head/$pr"
  if ! git show-ref --verify --quiet "$head_ref"; then
    echo "Skipping PR #$pr (missing head ref)."
    continue
  fi

  pr_head_sha="$(git rev-parse "$head_ref")"
  source_branch="$(git for-each-ref --format='%(refname:short) %(objectname)' "refs/remotes/$REMOTE" \
    | awk -v remote="$REMOTE" -v sha="$pr_head_sha" '$2 == sha && $1 !~ ("^"remote"/pr-(head|merge)/") && $1 != remote"/""'$MAIN_BRANCH'" {print $1; exit}')"

  if [ -z "$source_branch" ]; then
    echo "Skipping PR #$pr (could not map PR head to a remote source branch)."
    continue
  fi

  source_branch_name="${source_branch#${REMOTE}/}"
  local_branch="pr-$pr"

  echo "\nRebasing PR #$pr ($source_branch_name) onto $REMOTE/$MAIN_BRANCH"
  git checkout -B "$local_branch" "$head_ref"

  if git rebase "$REMOTE/$MAIN_BRANCH"; then
    echo "PR #$pr rebased cleanly."
  else
    echo "Conflict detected on PR #$pr. Auto-resolving in favor of PR branch changes..."
    while [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; do
      mapfile -t conflicted < <(git diff --name-only --diff-filter=U)
      if [ "${#conflicted[@]}" -eq 0 ]; then
        break
      fi
      for file in "${conflicted[@]}"; do
        git checkout --theirs -- "$file"
        git add "$file"
      done
      GIT_EDITOR=true git rebase --continue || true
    done

    if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
      echo "Unable to auto-resolve PR #$pr. Aborting rebase."
      git rebase --abort
      continue
    fi
  fi

  git push --force-with-lease "$REMOTE" "HEAD:refs/heads/$source_branch_name"
  echo "Updated $source_branch_name for PR #$pr"
done

echo "Done."
