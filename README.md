# 🐺 Loup-Garous GM Assistant

A **Game Master (DM) assistant** for Loup-Garous / Werewolf, built as a **React PWA** that runs in any browser and can be installed as a native app on Android via the Play Store (using a PWA wrapper like Bubblewrap/TWA).

---

## ✨ Features

| Feature | Description |
|---|---|
| **Player setup** | Configure 5–20 players with names and role assignments |
| **All classic roles** | Villager, Werewolf, Seer, Witch, Hunter, Cupid, Little Girl, Mayor, Protector, Elder, Village Idiot, Scapegoat, Bear Tamer, Raven, Fox |
| **Night phase wizard** | Step-by-step guidance through every night action in correct order |
| **Day/Night toggle** | Instantly switch between phases; actions update accordingly |
| **One-time ability tracking** | Witch's healing/death potions tracked automatically |
| **First-night-only actions** | Cupid's lover link only shown on round 1 |
| **Seer reveal** | DM-only card peek shown inline |
| **Bear Tamer signal** | Automatic growl/silent indicator based on neighbors |
| **Discussion timer** | Configurable countdown with colour warnings and pause/reset |
| **Voting board** | Tap +/- to count votes; mayor double-vote accounted for; Raven +2-vote curse applied |
| **Tie-breaker** | Select tied players → random pick with one-click confirmation |
| **Trigger alerts** | Hunter, Elder, Village Idiot, Mayor succession triggers highlighted on reveal/elimination |
| **Lovers chain** | Cupid lovers die together automatically |
| **Win detection** | Automatic village / werewolf win check |
| **Role reference** | Filterable by Night / Day; shows all actions and triggers |
| **Game log** | Chronological event history |
| **Optional rules** | Per-game toggles for Elder, Scapegoat, etc. |
| **PWA** | Installable on Android and iOS via the browser's "Add to Home Screen" prompt |
| **Persistent state** | Game state saved to localStorage, survives page reload |

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## 🏗️ Build for Production

```bash
npm run build
# Output is in dist/
```

## ✅ End-to-End Test (Playwright)

Automated flow to reproduce the reported black-screen issue:

```bash
npm run test:e2e
```

The test spins up the Vite dev server, runs a 6-player (2 wolves, 4 villagers) round, verifies roles display, phases transition, and captures artifacts if a crash/black screen occurs.

## 📱 Android / Play Store

This app ships a **Web App Manifest** (`public/manifest.json`), making it a PWA.

To publish on Google Play:

1. Build the app: `npm run build`
2. Use **[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)** or **[PWA Builder](https://www.pwabuilder.com/)** to wrap the hosted URL as a Trusted Web Activity (TWA).
3. Upload the generated `.aab` to the Play Console.

---

## 🎮 Game Flow

```
Setup → Night (ordered role steps) → Day (timer + vote + tie-break) → Night → …
```

### Night order
1. Cupid (first night only)
2. Little Girl (passive peek)
3. Protector
4. Werewolves → victim chosen
5. Fox (sniff)
6. Seer → card revealed to DM
7. Witch → save / poison
8. Raven → curse next day vote

### Day order
1. Bear Tamer signal (auto)
2. Announce night deaths + trigger alerts
3. Discussion timer
4. Vote tally (with Mayor ×2, Raven +2)
5. Execute or invoke tie-breaker
6. Proceed to next night

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** (persistent state via localStorage)
- Pure CSS (dark werewolf theme, mobile-first)

## 🏗️ Project Structure

```
src/
  types/        TypeScript interfaces
  data/         Role definitions (night order, actions, triggers)
  store/        Zustand game state
  components/
    Setup/      Player & role configuration screen
    Game/       GameBoard, NightPhase, DayPhase, Timer, TieBreaker, PlayerCard
    Roles/      Filterable role reference panel
  styles/       Component CSS files
public/
  manifest.json PWA manifest
```
