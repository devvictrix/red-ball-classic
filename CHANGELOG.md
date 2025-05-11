# File: CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Red Ball Classic

### Added
- (Internal) Added `soundsLoaded` ref to `game.tsx` to prevent multiple sound loading attempts.
- Added placeholder `.wav` sound files (`bounce.wav`, `game_over.wav`) instructions for testing.

### Changed
- **`FR-UX-01` Visual/Audio Feedback:** Migrated from deprecated `expo-av` to `expo-audio` for sound playback.
- Updated sound asset loading in `game.tsx` to use relative paths (`require('../../assets/sounds/...')`) to resolve loading issues.
- `package.json`: Replaced `expo-av` with `expo-audio`.

### Fixed
- Resolved sound loading error "Requiring unknown module undefined" by switching to relative paths for sound assets and migrating to `expo-audio`.

## [0.0.1] - 2025-05-10 (Active Development Version)

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

### Changed
- **Project Pivot (2025-05-10):** To "Red Ball Classic".
- `package.json`: Version set to `0.0.1`.
- Documentation updated for "Red Ball Classic".

### Removed
- Obsolete "StickerSmash" planning.

## Previous Obsolete Version (StickerSmash)
# ... (content remains)