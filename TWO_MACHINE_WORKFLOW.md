# Working safely on two computers

This repository is the shared source of truth. Shopify is the deployment target, not the version-control system.

## One-time setup on a new computer

1. Install Git, Node.js, Shopify CLI, and ChatGPT/Codex.
2. Clone the private repository.
3. Open the cloned folder as a local Codex project.
4. Start a new Codex task with:

   `Read PROJECT_HANDOFF.md and TWO_MACHINE_WORKFLOW.md completely. Inspect git status and the active branch, then continue the requested work without changing unrelated files.`

5. Sign in to Shopify CLI on that computer. Login state is intentionally not stored in Git.

## Temporarily moving work from one computer to the other

Before leaving computer A:

```powershell
git status
git add -A
git commit -m "checkpoint: describe current work"
git push
```

On computer B:

```powershell
git fetch --all --prune
git switch <the-same-branch>
git pull --ff-only
```

Never move machines with uncommitted work left only on the first computer.

## Working on both computers in parallel

- Use a different branch for every independent task, for example:
  - `work/machine-a-hot-deals`
  - `work/machine-b-shop-the-look`
- Do not edit the same component on two branches at the same time.
- Push each branch regularly and merge it into `main` only after review/QA.
- Before starting a task, update from `main`.
- Only one designated branch or computer should publish to the live Shopify theme.

Recommended start:

```powershell
git switch main
git pull --ff-only
git switch -c work/<machine>-<task>
```

Recommended finish:

```powershell
git add -A
git commit -m "feat: describe the completed change"
git push -u origin HEAD
```

## Conflict rule

If both machines changed the same Liquid, JSON, CSS or JavaScript component, stop before publishing. Merge and QA the combined result locally first. Never resolve a theme conflict by blindly choosing one whole file.

## Shopify rule

- Use `shopify theme dev` or a draft theme for QA.
- Pulling the live theme is an emergency recovery method, not the normal way to synchronize source.
- Never run a live push from both machines simultaneously.

