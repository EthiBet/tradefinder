# 8-cat trade analyzer

A static site for comparing fantasy basketball trades across 8 categories (PTS, REB, AST, STL, BLK, 3PM, FG%, FT%). FG% and FT% are computed from makes and attempts, so team percentages are weighted correctly.

## Files

- `index.html`, `style.css`, `app.js`, `finder.js`: the site (analyzer tab and trade finder tab)
- `data/players.json`: player stats (filled by the update script)
- `scripts/update_stats.py`: pulls current-season per-game stats
- `.github/workflows/update-stats.yml`: runs the script daily

## Put it online (GitHub Pages)

1. Create a new GitHub repository and upload everything in this folder.
2. Go to Settings, then Pages. Set the source to "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Your site appears at `https://<your-username>.github.io/<repo-name>/`.

## Live stats

`scripts/update_stats.py` pulls current-season per-game averages with the free [`nba_api`](https://github.com/swar/nba_api) package (no API key) and writes `data/players.json`. The site reads that file, so typing a player name fills in their stats.

**Option A: GitHub Actions (automatic).** `.github/workflows/update-stats.yml` runs daily and commits fresh data. Run it once by hand from the Actions tab. Note: stats.nba.com often refuses requests from cloud hosts such as GitHub's runners. If the run fails, add a repository secret named `NBA_API_PROXY` (a proxy URL), or use Option B.

**Option B: run it on your own computer.**

```
pip install nba_api
python scripts/update_stats.py
git add data/players.json && git commit -m "Update stats" && git push
```

Schedule that with cron (Mac/Linux) or Task Scheduler (Windows) if you want it automatic.

## Local preview

Browsers block file loading from `file://`, so use `python -m http.server` in this folder and open http://localhost:8000.

Data comes from NBA.com and is subject to the NBA.com Terms of Use. This project is not affiliated with the NBA.
