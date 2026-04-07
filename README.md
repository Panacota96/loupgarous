# 🐺 Loup-Garous GM Assistant

A **Game Master (DM) assistant** for Loup-Garous / Werewolf, built as a **React app** with an existing **Capacitor Android wrapper**. The web app remains the source of truth, and the `android/` folder is the Android Studio project used to run the app on a device or emulator.

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
| **Android wrapper** | Existing Capacitor project opens directly in Android Studio |
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

## 📱 Android Studio Workflow

This repository already includes the Android Studio project in `android/`. Do not create a second native app for local development.

### First-time setup

```bash
npm install
npm run cap:sync
```

`npm run cap:sync` builds the web app into `dist/` and copies those assets into the Capacitor Android project.

### Open in Android Studio

1. Open the `android/` folder in Android Studio.
2. Let Gradle sync complete.
3. If Android Studio asks for an SDK path, let it create `android/local.properties` or point it to your installed Android SDK.
4. Select an emulator or device and press Run.

### After web changes

Whenever you change the React app:

```bash
npm run cap:sync
```

Then run the app again from Android Studio. The Android shell loads built files from `dist/`; it does not use the Vite dev server.

### Notes

- Android Studio project root: `android/`
- Local SDK config file: `android/local.properties` (local only, not committed)
- Capacitor config: `capacitor.config.ts`
- Android package id: `com.panacota96.loupgarous`
- More detail: [`docs/android-setup.md`](./docs/android-setup.md)

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

## 🧭 Quick Balance Guide

- **Wolf ratio**: 1 wolf for 4–5 players is a good starting point.
  - 5–6 players → 1 wolf
  - 7–9 players → 2 wolves
  - 10–12 players → 3 wolves
  - 13–16 players → 4 wolves
  - 17–20 players → 4–5 wolves (depending on how many swingy roles you add)
- **Beginner-friendly roles**: Seer, Protector, Witch, Hunter, Mayor/Captain.
- **Advanced / swingy roles**: Little Girl, Big Bad Wolf, Infect Père des Loups, Village Idiot, Scapegoat, Bear Tamer, Raven, Fox, Cupid.
- **Balancing tips**:
  - Keep at least as many plain Villagers as special roles so deduction still matters.
  - Add only 1–2 chaotic roles (Raven, Fox, Cupid) at a time.
  - If you include many info roles, increase wolves by +1 to keep nights threatening.

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** (persistent state via localStorage)
- Pure CSS (dark werewolf theme, mobile-first)

## 🚢 Release Tracks

- `main`: integration branch for shared code
- `release/web`: protected branch for GitHub Pages deployments
- `release/mobile`: protected branch for Android QA and Google Play releases

Release runbooks and setup docs live in [`docs/release/branching-model.md`](./docs/release/branching-model.md), [`docs/release/web-release.md`](./docs/release/web-release.md), [`docs/release/android-release.md`](./docs/release/android-release.md), [`docs/release/android-qa-checklist.md`](./docs/release/android-qa-checklist.md), [`docs/release/google-play-launch-checklist.md`](./docs/release/google-play-launch-checklist.md), and [`docs/release/runbooks.md`](./docs/release/runbooks.md).

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
