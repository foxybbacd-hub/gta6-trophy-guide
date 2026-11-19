# GTA VI Trophy Guide & Tracker

![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)
![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/foxybbacd-hub/gta6-trophy-guide/rank.svg)
![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/foxybbacd-hub/gta6-trophy-guide/reward.svg)

An offline guide and tracker for all 55 PlayStation 5 trophies in Grand Theft Auto VI — built for the [make.fun bounty gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, with the official name, description and grade** — 1 platinum, 2 gold, 6 silver, 46 bronze (28 hidden), as PlayStation publishes them.
- **An own-words guide for each trophy**, saying what to do, where and how, and when it can be missed — each one citing its sources (GTABase, Exophase, PSNProfiles, Vice City Hub, Planet GTA 6, GGRecon, PowerPyx, Push Square), never copied from them.
- **A roadmap to the platinum** in three steps, built from the official descriptions: the five story chapters, the 100% checklist, and Strangers & Freaks. About 200 hours, one playthrough, no online trophies.
- **The missable flag** — only one trophy is possibly missable (Positive Mental Attitude, a Chapter 1 meditation), and the guide says plainly where the exact steps are not confirmed yet.
- **A tracker**: tick trophies off as you earn them; progress is saved in the browser and can be exported to a file and imported back. Filter by kind (story, missable, collectibles, activities, crime, money) and grade, search by name, mission or place, and switch on the spoiler setting to hide story trophies' names and descriptions until you have earned them.

## Run it

Static files, no build step, works offline in desktop Chrome with zero network requests. Serve `app/` locally:

```sh
node serve.ts
```

then open http://localhost:8080.

## Notes

- Unofficial fan guide, not affiliated with Rockstar Games. It uses no Rockstar logo, artwork or game screenshots; the look is its own.
- Trophy names and descriptions are shown as PlayStation publishes them; the guides are written for this page, in our own words, from the sources listed in `app/data/trophies.json`.
