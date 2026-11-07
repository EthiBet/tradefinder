"""Fetch current-season per-game NBA stats and write data/players.json."""
import json, os, sys, time
from datetime import datetime, timezone
from nba_api.stats.endpoints import leaguedashplayerstats

now = datetime.now(timezone.utc)
start = now.year if now.month >= 10 else now.year - 1
season = f"{start}-{str(start + 1)[-2:]}"
proxy = os.environ.get("NBA_API_PROXY") or None

df = None
for attempt in range(1, 4):
    try:
        df = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season,
            season_type_all_star="Regular Season",
            per_mode_detailed="PerGame",
            timeout=60,
            proxy=proxy,
        ).get_data_frames()[0]
        break
    except Exception as e:
        print(f"Attempt {attempt} failed: {e}", file=sys.stderr)
        time.sleep(5 * attempt)

if df is None or df.empty:
    sys.exit("No data returned. stats.nba.com may be blocking this network; see README.")

r = lambda x: round(float(x), 2)
players = [
    {
        "name": row.PLAYER_NAME, "team": row.TEAM_ABBREVIATION, "gp": int(row.GP), "min": r(row.MIN),
        "pts": r(row.PTS), "reb": r(row.REB), "ast": r(row.AST),
        "stl": r(row.STL), "blk": r(row.BLK), "tpm": r(row.FG3M),
        "fgm": r(row.FGM), "fga": r(row.FGA), "ftm": r(row.FTM), "fta": r(row.FTA),
    }
    for row in df.itertuples()
]
players.sort(key=lambda p: p["name"])
out = {"season": season, "updated": now.strftime("%Y-%m-%d"), "players": players}
with open("data/players.json", "w", encoding="utf-8") as f:
    json.dump(out, f, separators=(",", ":"))
print(f"Wrote {len(players)} players for {season}")
