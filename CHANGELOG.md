// File: CHANGELOG.MD

# File: CHANGELOG.MD

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Red Ball Classic - Playful Discovery MVP

### Added
- **Project Pivot: "Red Ball Classic - Playful Discovery"** for ages 2-4.
    - New `GAME_DESIGN.MD` ("Playful Discovery") focused on gentle, exploratory play.
    - New `USER_PERSONA.MD` ("Playful Explorer") detailing the target 2-4 year old user.
    - Updated `FEATURE_ROADMAP.MD` to reflect "Playful Discovery" features.
    - Updated `AI_INSTRUCTIONS.MD` for the new game direction.
- **GDD-BALL-GENTLE:** Implemented very slow ball movement, gentle upward bounce from paddle, and a non-punitive reset mechanism (ball briefly hides then reappears) if missed.
- **GDD-PADDLE-GENTLE:** Implemented larger, friendly paddle with direct, smooth touch control. Added gentle squash animation on ball hit.
- **GDD-TARGETS-INTRO:**
    - Added `TargetView.tsx` component for interactive targets.
    - Added `useTargets.ts` hook to manage target creation, positioning, and interaction.
    - Targets provide visual (animation) and haptic feedback on hit. When hit, targets "reset" by changing position/color/shape.
- **GDD-CONTINUOUS-PLAY:** Removed "Game Over" and "Level Cleared" states. Play is continuous.
- **GDD-UI-SIMPLE:**
    - `GameOverlay.tsx` simplified to show a large "Play" button to start.
    - `SettingsPanel.tsx` integrated into the start overlay for Haptics and Sound toggles.
- **FR-UX-02-GENTLE:** Integrated gentle haptic feedback for paddle hits, target hits, and wall taps, controlled by user setting.
- **FR-UI-03-GENTLE:** Settings for Haptics and Sound can be toggled and persist via AsyncStorage (via `useGameSettings.ts`).
- **NFR-APPSTATE-01 (Adapted):** Game now gently pauses (shows start overlay) if app is backgrounded.
- New child-friendly color palettes in `constants/Colors.ts`.
- Updated `constants/gameConstants.ts` with values suitable for gentle play (larger elements, slower speeds).
- New `docs/TECHNICAL_DESIGN.MD` written to reflect the architecture of "Playful Discovery."

### Changed
- **Heavily Refactored `app/(tabs)/paddle-game.tsx`:**
    - Game loop simplified for gentle interactions.
    - Removed scoring, high scores, difficulty progression, complex collision physics.
- **Updated Hooks:**
    - `useBall.ts`: Simplified speed logic, added gentle reset. Removed `increaseDifficulty`.
    - `usePaddle.ts`: Simplified paddle hit animation.
    - `useGameSettings.ts`: Added sound toggle logic and placeholder for sound playback.
    - `GameOverlay.tsx`: Rewritten for simple start and settings access.
- `ADR-006-High-Score-Persistence.md` marked as deprecated.

### Removed
- **Deprecated Gameplay Mechanics from "Arcade Escalator":**
    - Scoring system and high score display.
    - Aggressive ball speed increases and difficulty progression.
    - Breakable bricks (`useBricks.ts` and `BrickView.tsx` effectively replaced by targets system).
    - "Game Over" and "Level Cleared" states and UI.
    - Complex power-ups/hazards concepts from previous design.
- Obsolete constants related to the old game design from `constants/gameConstants.ts`.

### Fixed
- (Conceptual) Ensured all game mechanics align with the "Playful Discovery" design for a 2-4 year old audience.

## [0.0.1] - 2025-05-10 (Active Development Version - Pre-Pivot)
*This version reflects the "Red Ball Classic - Arcade Escalator" concept.*

### Added
- **Project Initialization for "Red Ball Classic"**.
- **`FR-AREA-01` Game Area & Boundaries**.
- **`FR-BALL-01` Red Ball Display** & **`FR-BALL-02` Ball Movement & Wall Bouncing**.
- **`FR-PADDLE-01` Paddle Display** & **`FR-PADDLE-02` Paddle Control**.
- **`FR-COLLIDE-01` Ball-Paddle Collision & Bounce**.
- **`FR-GAMEOVER-01` Game Over Condition**.
- **`FR-SCORE-01` Scoring System & `FR-UI-01` Score Display (v0.2.0 feature)**.
- **`FR-UI-02` Start / Restart Game UI & Flow (v0.2.0 feature)**:
  - Refined game start with "Tap to Start" overlay.
- **`FR-UX-01` Basic Visual/Audio Feedback (v0.2.0 feature)**:
  - Integrated `expo-av` (now `expo-audio`) for sound effects.
  - Added placeholders for `bounce_wall`, `bounce_paddle`, and `game_over` sounds.
  - Implemented sound playback for wall hits, paddle hits, and game over.
  - Added a simple visual scale "pop" to the paddle on ball collision using Reanimated.
- (Internal) Added `soundsLoaded` ref to `game.tsx` to prevent multiple sound loading attempts.
- Added placeholder `.wav` sound files (`bounce.wav`, `game_over.wav`) instructions for testing.

### Changed
- **`FR-UX-01` Visual/Audio Feedback:** Migrated from deprecated `expo-av` to `expo-audio` for sound playback.
- Updated sound asset loading in `game.tsx` to use relative paths (`require('../../assets/sounds/...')`) to resolve loading issues.
- `package.json`: Replaced `expo-av` with `expo-audio`.
- **Project Pivot (2025-05-10):** To "Red Ball Classic".
- `package.json`: Version set to `0.0.1`.
- Documentation updated for "Red Ball Classic".

### Fixed
- Resolved sound loading error "Requiring unknown module undefined" by switching to relative paths for sound assets and migrating to `expo-audio`.

### Removed
- Obsolete "StickerSmash" planning.

## Previous Obsolete Version (StickerSmash)
# ... (content remains)