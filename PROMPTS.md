# How Ironvale was made: the prompts

Ironvale was built entirely by talking to an AI coding agent: **Claude Fable 5.2 running in Claude Code**. No game engine, no hand-written code. The human wrote short requests in plain language; the model wrote the code, tested it in a real browser, fixed what broke and reported back.

This page lists the requests in order (lightly tidied for spelling), so you can see how little it takes and try it yourself.

## The prompts, in order

| # | What was asked | What came out of it |
|---|---|---|
| 1 | A written spec for "an original 3D real-time strategy game in one HTML file": gather, build, three ages, army, AI opponent, fog of war, menus, sound. Original name and factions, nothing copied from existing games. | The first playable Ironvale: one HTML file with three.js. |
| 2 | "Open it in my browser." | The game launched locally. |
| 3 | "I need better-looking characters. Tree cutting and food gathering should be visible tasks done by workers, with an auto-collect option. Make the whole map look good too." | Animated work, felled trees, an AUTO-WORK button. |
| 4 | (Screenshot of a carcass) "Food should auto collect." | Hunters carry meat home on their own. |
| 5 | "Use realistic models from here" + a link to a free model site. | A model baker tool and the first downloaded CC0 models. |
| 6 | Seven model links: "Add these characters." | Animated villagers, soldiers, riders. |
| 7 | Nineteen model links: "Add more animals. Based on all these models, add new handling methods." | Wildlife with behaviours: prey flees, predators hunt, livestock grazes. |
| 8 | Eleven model bundle links + "Remove this animation, it's not good. Make a story from these models. Add building upgrades, an attack-enemy option, a fully viewable map, a better view controller, and multiple large map types: village, water, hills." | Story campaign, upgrades, attack-move, camera panel, five map themes. |
| 9 | "Remove all old low-poly characters and buildings, use high-quality models only. I want nature vibes like this pack, with a night mode and weather." | Day/night cycle, rain, snow, fog, wind. |
| 10 | "Enhance the UI, make it realistic. Focus on water, it shows on land and looks bad. Make the view controller easier and animations better. Fix errors." | New water, wood-and-brass UI, compass camera control. |
| 11 | "What updates are required?" then "Do all." | Save/load, tutorial tips, auto graphics quality, AI surrender and more. |
| 12 | "Enhance the UI more and make graphics highly realistic." | Post-processing: ambient occlusion, bloom, colour grading. |
| 13 | Three meat model links: "Use these after killing animals." | Meat models replace carcasses. |
| 14 | "Graphics look a little unreal now, make it better." | More natural, less saturated grading. |
| 15 | "What more good can I do in the UI?" then "Do all." | Event log, tech tree, control groups, hotkey editor, end-of-game chart. |
| 16 | A pasted article about a well-known strategy game's campaigns: "I want to add something similar." | Three original sagas, five original realms and a Chronicle. Nothing was copied. |
| 17 | "Add unique units and buildings for each realm." + a screenshot: "Fix UI." | Five unique units, five unique buildings, tidy menu. |
| 18 | "What important update is needed now? I also need a quick hack for faster growth, a boost option." | Growth boost (2x / 4x). |
| 19 | "Do all updates." | AI fix, realm looks, campaign playtest, balance pass, phone layout, save slots. |
| 20 | "Make an offline exe, a portable version, with an icon." | `Ironvale.exe`, one file, 5.8 MB. |
| 21 | "Push it to GitHub and make it live." | This repository and the live page. |
| 22 | "Put some screenshots with a detailed map in the repo." | The screenshots in the README. |

## What made it work

1. **Start with a clear spec, then iterate in small asks.** The first prompt described the whole game in a page. Everything after it was one or two sentences.
2. **Show, don't describe.** Several of the best fixes came from pasting a screenshot and saying "fix this".
3. **Ask the model what to do next.** "What update is required?" followed by "do all" produced the most useful batches of work.
4. **Bring your own assets.** Links to free, openly licensed 3D models turned a box-and-cylinder prototype into something with character. Check each model's licence and credit the authors.
5. **Give honest feedback.** "This animation is not good" and "graphics look a little unreal" are perfectly good prompts.
6. **Let it test.** The model ran the game in a browser, played AI-versus-AI matches, read the console and fixed its own bugs before reporting.

## Try it yourself

1. Install [Claude Code](https://claude.com/claude-code) and pick an empty folder.
2. Describe the game you want in a paragraph or a page. Say it must be original: your own name, factions and story.
3. Ask it to open the result, play, and tell it what feels wrong.
4. Repeat. Ironvale took 21 requests.

Make something of your own. Don't ask for a copy of an existing game; ask for the kind of game you love and let the details be new.
