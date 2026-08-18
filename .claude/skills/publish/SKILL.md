---
name: publish
description: Publish a reviewed test page (test2027.html, *-test.html) to its live counterpart on excellencepianobynatalia.com — copies the content over, commits, pushes, opens a PR, and merges it. Use when the user says "publie", "mets en ligne", "publish this", or asks to push a test page to the real site.
---

# Publish a test page to the live site

This repo's workflow: new content/design work is drafted in a **test page** first
(e.g. `test2027.html`, `formules-de-paiement-test.html`), deployed live via GitHub
Pages so the user can preview it at its own URL, then — once approved — copied onto
the **real page** that visitors actually see.

This skill performs that last step: test page → live page.

## 1. Identify the test file and its live counterpart

Known mappings:

| Test file | Live file |
|---|---|
| `test2027.html` | `index.html` |
| `formules-de-paiement-test.html` | `formules-de-paiement.html` |

For any other file following the `<name>-test.html` pattern, the live counterpart is
`<name>.html`. If the argument passed to this skill doesn't match a known mapping
and isn't a `*-test.html` file, or if more than one test file has uncommitted/recent
changes and it's unclear which one to publish, ask the user which page to publish
rather than guessing.

## 2. Confirm before publishing

Only publish a test page the user has actually seen and approved in this conversation
(or an earlier one, if they explicitly say so — e.g. "publie la page des tarifs
qu'on avait faite"). If there's no clear approval in context, ask first — this
overwrites what real visitors see.

## 3. Sync and branch

```
git fetch origin main -q && git checkout main -q && git pull origin main -q
git checkout -B claude/publish-<short-topic-slug>
```

## 4. Copy test → live

Copy the test file's content onto the live file exactly:

```
cp <test-file> <live-file>
```

Do not carry over anything that only makes sense for the test file itself (there
currently isn't any — both pages share the same head/header/footer/nav boilerplate).
If the live file has diverged in ways the test file doesn't reflect (check
`git diff <live-file>` before overwriting, and `git log -3 -- <live-file>` if
unsure), stop and flag it to the user instead of silently discarding those changes.

## 5. Commit, push, PR, merge

Commit message: summarize *what* is going live (not "copy test to live" — describe
the actual content/design change, drawn from the test page's own commit history if
useful context).

```
git add <live-file>
git commit -m "..."
git push -u origin claude/publish-<short-topic-slug>
```

Open a PR (base `main`), then merge it (squash) — this *is* the publish action, so
unlike other changes in this repo, no separate merge confirmation is needed once the
user has approved the test page per step 2.

## 6. Confirm to the user

Tell the user it's live, note the ~1-2 minute GitHub Pages redeploy delay, and give
the real URL (e.g. `https://excellencepianobynatalia.com/<live-file>`).

## Notes

- Never delete the test file — it stays as the ongoing staging draft for the next
  round of changes to that page.
- If the test and live file are already identical (`diff` reports no changes),
  say so instead of creating an empty PR.
