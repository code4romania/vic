# Maintenance page for the launch window (0:00 – 0:45)

The old web (vic `main`, 1.1.0) has no maintenance mode, and from 0:00 its API is scaled to 0.
The maintenance commits replace the web build with one static page (`index.html` here, ro + en): `npm run build`
only copies it to `dist/`. Amplify's SPA rewrite already sends every path to `/index.html`, so every
URL of vic.ngohub.ro shows it. No terraform or Amplify console change is needed.

## 0:00 — switch the web to maintenance

    git fetch origin
    git merge-base --is-ancestor origin/main origin/launch/maintenance-page && echo ok   # main unchanged since the branch
    git push origin origin/launch/maintenance-page:refs/heads/main

Amplify builds `main` (a few minutes; `npm ci` still runs). Check https://vic.ngohub.ro and a deep
link such as https://vic.ngohub.ro/volunteers: both show the maintenance page.

## 0:45 — the new web

Revert this commit, then merge `develop` (main is an ancestor of develop, so the merge has no conflicts):

    git checkout main && git pull --ff-only
    # the maintenance commits only (newest first); the branch tip is a merge of main
    git revert --no-edit $(git log --format=%H --no-merges origin/develop..HEAD -- frontend/maintenance frontend/package.json)
    git merge --no-ff origin/develop -m "Release VIC 2.0.0"
    git diff origin/develop --stat      # must print nothing: main == develop
    git push origin main

## No-go before 0:45

    git checkout main && git pull --ff-only && git revert --no-edit $(git log --format=%H --no-merges origin/develop..HEAD -- frontend/maintenance frontend/package.json) && git push origin main

Amplify rebuilds the old web (1.1.0) as it was.
