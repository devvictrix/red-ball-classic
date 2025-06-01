// File: docs/FEATURE_ROADMAP.MD

# Red Ball Classic - Feature Roadmap

## 0. Development Flags (Set by DevLead)

- **Enable Sound Features for v1.0.0 MVP:** `false`
  - _Set to `true` to activate sound-related features (code integration, UI toggles, playback logic) as part of the v1.0.0 MVP. If `false`, these are considered `[Postponed]` for MVP, awaiting enablement._
- **Enable Unit Test Implementation for v1.0.0 MVP:** `false`
  - _Set to `true` to proceed with setting up the test environment (e.g., Jest) and writing unit tests. If `false`, test implementation is `[Postponed]` for MVP, even if planning is done._
- **Enable Changelog Updates for v1.0.0 MVP:** `false`
  - _Set to `true` to actively maintain `CHANGELOG.MD` with each feature implementation during MVP development. If `false`, changelog updates are `[Postponed]` for MVP, to be potentially batched later._
- **Enable Music Features (vFuture):** `false`
  - _Set to `true` when ready to plan/develop background music or advanced soundscapes._

## 1. Introduction

This document outlines the development roadmap for "Red Ball Classic". It tracks completed features, ongoing work, and planned enhancements for future versions. Its purpose is to provide a clear overview of the project's trajectory.

**Legend:**

- `[Done]` - Feature is implemented, tested, and stable in the current or a previous version.
- `[In Progress]` - Feature is actively being developed.
- `[Planned]` - Feature is approved and scheduled for a future version.
- `[Considered]` - Feature is an idea under consideration.
- `[Postponed]` - Feature was planned but is currently on hold.
- `[Deprecated]` - Feature was removed or replaced.

---

## 2. v0.2.0 - Core Foundation (Pre-MVP)

This version represents the foundational gameplay and technical setup of "Red Ball Classic". All features listed here are assumed to be the baseline.

| Feature ID                  | Description                               | Status   | Notes                                                                                                                              |
| --------------------------- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Core Gameplay Mechanics** |                                           |          |                                                                                                                                    |
| FR-AREA-01                  | Game Area & Boundaries                    | `[Done]` | Dynamically sized game area, clear visual boundaries, fixed aspect ratio.                                                          |
| FR-BALL-01                  | Red Ball Display                          | `[Done]` | Visually distinct ball.                                                                                                            |
| FR-BALL-02                  | Ball Movement & Wall Bouncing             | `[Done]` | Ball moves, bounces realistically off top/left/right walls.                                                                        |
| FR-PADDLE-01                | Paddle Display                            | `[Done]` | Visually distinct player-controlled paddle.                                                                                        |
| FR-PADDLE-02                | Paddle Control                            | `[Done]` | Smooth, responsive touch/drag control, constrained. Implemented with `react-native-gesture-handler` and `react-native-reanimated`. |
| FR-COLLIDE-01               | Ball-Paddle Collision & Bounce            | `[Done]` | Ball bounces off paddle, variable angle, speed increases slightly (base).                                                          |
| FR-GAMEOVER-01              | Game Over Condition                       | `[Done]` | Game ends if ball goes past paddle.                                                                                                |
| FR-SCORE-01                 | Scoring System                            | `[Done]` | Score increments on successful paddle hit and brick breaks.                                                                        |
| FR-SCORE-02                 | High Score Persistence                    | `[Done]` | Highest score saved locally (`AsyncStorage`) and displayed.                                                                        |
| **UI & UX**                 |                                           |          |                                                                                                                                    |
| FR-UI-01                    | Score Display                             | `[Done]` | Current and high score displayed.                                                                                                  |
| FR-UI-02                    | Start / Restart Game UI & Flow            | `[Done]` | "Tap to Start" overlay, "Game Over" screen with "Play Again" option. "Level Cleared" overlay.                                      |
| FR-UX-01                    | Basic Visual & Audio Feedback             | `[Done]` | Visual paddle "pop" animation. Haptics. Sound effects code structure (actual sounds TBD based on flag).                            |
| NFR-THEME-01                | Light/Dark Mode Support                   | `[Done]` | Game UI adapts to system light/dark mode preferences. Arcade-style color palette.                                                  |
| NFR-APPSTATE-01             | App State Handling                        | `[Done]` | Game pauses if app goes to background during active play.                                                                          |
| **Technical Foundation**    |                                           |          |                                                                                                                                    |
| NFR-TECH-01                 | Core Framework: React Native with Expo    | `[Done]` |                                                                                                                                    |
| NFR-TECH-02                 | Navigation: Tab-based via Expo Router     | `[Done]` |                                                                                                                                    |
| NFR-TECH-03                 | Sound Engine: `expo-av` (or `expo-audio`) | `[Done]` | Sound loading/playback capability.                                                                                                 |
| NFR-TECH-04                 | Version Control: Git                      | `[Done]` |                                                                                                                                    |
| NFR-TECH-05                 | ADRs Documented                           | `[Done]` | Key architectural decisions recorded (ADR-001 to ADR-007, ADR-006 for High Score is relevant again).                               |

---

## 3. v1.0.0 - First Playable MVP (Arcade Escalator)

This version aims to deliver a polished and engaging Minimum Viable Product of the arcade game.

| Feature ID                                                                               | Description                                    | Priority | Status        | Notes                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gameplay Enhancements**                                                                |                                                |          |               |                                                                                                                                                                           |
| FR-LEVELS-01                                                                             | Difficulty Progression (Ball Speed)            | High     | `[Done]`      | Ball speed increases based on score (e.g., every N points, up to a cap) using `increaseDifficulty` in `useBall`.                                                          |
| FR-OBSTACLES-01                                                                          | Breakable Bricks (Basic Implementation)        | High     | `[Done]`      | Grid of standard, single-hit bricks. Ball collision destroys bricks, score awarded. Level cleared state when all bricks gone. New wave starts.                            |
| FR-OBSTACLES-01A                                                                         | Multi-Hit Bricks                               | High     | `[Done]`      | Bricks now support requiring 1, 2, or 3 hits to be destroyed. `hitsRequired` assigned based on score tier during initialization. Visual damage indicated by color change. |
| **UI/UX Improvements**                                                                   |                                                |          |               |                                                                                                                                                                           |
| FR-UX-02                                                                                 | Enhanced Haptic Feedback                       | Medium   | `[Done]`      | Haptics for paddle/wall/brick hits (distinguishing damage vs. break), game over, level clear, UI interactions. Respects user setting.                                     |
| FR-UI-03                                                                                 | Basic Settings Screen                          | Medium   | `[Done]`      | Toggle for Haptics & Sound on game overlays (via `SettingsPanel`). Sound toggle visibility respects `ENABLE_SOUND_FEATURES_MVP` flag. Settings persist.                   |
| **Technical & Performance**                                                              |                                                |          |               |                                                                                                                                                                           |
| NFR-PERF-01                                                                              | Performance Optimization Review                | High     | `[Planned]`   | Code review for performance. Ensure game loop, animations, and physics are smooth.                                                                                        |
| NFR-CODE-01                                                                              | Code Refactoring & Cleanup (`paddle-game.tsx`) | High     | `[Planned]`   | Refactor for clarity, modularity (custom hooks for ball, paddle, bricks, score). Centralize game constants.                                                               |
| **Sound Features (Conditional based on Flag "Enable Sound Features for v1.0.0 MVP")**    |                                                |          |               |
| FR-UI-03-SOUND                                                                           | Sound Toggle in Settings                       | Medium   | `[Postponed]` | UI for sound toggle. Actual sound playback logic depends on flag. (Covered by FR-UI-03 but explicit for sound part).                                                      |
| NFR-AUDIO-01                                                                             | Sound System Finalization                      | Medium   | `[Postponed]` | Integrate arcade-style sounds (wall bounce, paddle hit, brick break, game over, level clear). Depends on flag.                                                            |
| **Testing (Conditional based on Flag "Enable Unit Test Implementation for v1.0.0 MVP")** |                                                |          |               |
| NFR-TEST-01                                                                              | Basic Unit Tests for Core Logic                | Medium   | `[Postponed]` | Strategy/target areas. Test environment setup and test writing deferred pending flag.                                                                                     |
| **Documentation (Conditional based on Flag "Enable Changelog Updates for v1.0.0 MVP")**  |                                                |          |               |
| NFR-DOCS-01                                                                              | `CHANGELOG.MD` Updates                         | Medium   | `[Postponed]` | Regular updates to `CHANGELOG.MD` to reflect implemented features and fixes. Deferred pending flag.                                                                       |

---

## 4. vFuture - Beyond MVP (Arcade Escalator - Post v1.0.0)

This section lists potential features and improvements for versions after the MVP.

| Feature ID                        | Description                                     | Status         | Notes                                                                                              |
| --------------------------------- | ----------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- |
| **Gameplay Enhancements**         |                                                 |                |                                                                                                    |
| FR-OBSTACLES-02                   | Advanced Bricks (Special Properties)            | `[Considered]` | Indestructible bricks, explosive bricks, etc. (Multi-hit is now part of FR-OBSTACLES-01A)          |
| FR-LEVELS-02                      | Difficulty Progression (Brick Hardness/Density) | `[Considered]` | Introduce harder bricks or denser layouts in new waves/levels based on score or level progression. |
| FR-POWERUPS-01                    | Power-Ups & Hazards                             | `[Considered]` | Collectible items (wider paddle, slow ball, multi-ball, speed burst, shrink paddle).               |
| FR-GAMEMODES-01                   | Additional Game Modes                           | `[Considered]` | E.g., Timed mode, Survival mode (limited lives).                                                   |
| **UI/UX Improvements**            |                                                 |                |                                                                                                    |
| FR-UI-04                          | Refined Game Over Screen                        | `[Considered]` | More engaging game over sequence, options to share score.                                          |
| FR-TUTORIAL-01                    | Interactive Tutorial/Onboarding                 | `[Considered]` | Brief tutorial for new players explaining controls and objectives.                                 |
| NFR-ACCESSIBILITY-01              | Accessibility Improvements                      | `[Considered]` | Review screen reader compatibility, text sizes, etc.                                               |
| **Technical & Advanced Features** |                                                 |                |                                                                                                    |
| NFR-CODE-02                       | Advanced Code Refactoring                       | `[Considered]` | Further modularization if game grows complex.                                                      |
| NFR-AUDIO-02                      | Advanced Sound Management & Music               | `[Considered]` | Dynamic soundscapes or background music. _Depends on "Enable Music Features" flag._                |
| NFR-TEST-02                       | Comprehensive Testing Suite                     | `[Considered]` | Expand unit, integration, and potentially E2E tests after `NFR-TEST-01` actual implementation.     |
| FR-LEADERBOARD-01                 | Online Leaderboards                             | `[Considered]` | Global or friend-based leaderboards. Requires backend.                                             |

---

## 5. Summary & Next Steps (To be updated by DevLead/AI after each significant change)

- **Last Update:** (Current Date - After adding Changelog flag to Roadmap)
- **Work Completed:**
  - Implemented `FR-OBSTACLES-01`: Basic breakable bricks logic.
  - Implemented `FR-OBSTACLES-01A`: Multi-hit bricks (1, 2, 3 hits) with visual damage indication (color change) and score-tiered toughness.
  - Implemented `FR-LEVELS-01`: Ball speed now increases with score.
  - Implemented `FR-UX-02`: Enhanced haptic feedback for key game events.
  - Implemented `FR-UI-03`: Settings for haptics (and sound placeholder) are available.
  - Updated `FEATURE_ROADMAP.MD` to include a conditional flag for `CHANGELOG.MD` updates (`NFR-DOCS-01`).
- **Overall Project Status:**
  - The core gameplay loop for the "Arcade Escalator" MVP (v1.0.0) is functionally rich.
  - Process for documentation updates (specifically changelog) is now also under a conditional flag.
- **Next Logical Task(s):**
  1.  **Testing & Balancing:** Thoroughly test multi-hit bricks and overall game balance.
  2.  **Proceed with `NFR-PERF-01` (Performance Optimization Review).**
  3.  **Proceed with `NFR-CODE-01` (Code Refactoring & Cleanup).**
  4.  **DevLead Decision:** Evaluate which features/tasks to enable next by toggling the respective development flags (Sound, Unit Tests, Changelog Updates).
  5.  If `Enable Changelog Updates for v1.0.0 MVP` is set to `true`, update `CHANGELOG.MD` with all implemented features for MVP.

---
