// File: CHANGELOG.MD

# File: CHANGELOG.MD

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Red Ball Classic - Arcade Escalator (Rollback & Refocus)

### Added
- Reinstated `useBricks.ts` and `BrickView.tsx` for arcade-style brick mechanics.
- Reinstated `useScore.ts` for score and high score management.
- Arcade-style color palette and game constants in `constants/Colors.ts` and `constants/gameConstants.ts`.
- Game Over and Level Cleared logic and UI overlays in `GameOverlay.tsx` and `paddle-game.tsx`.
- Difficulty progression (ball speed increase based on score) in `useBall.ts`.

### Changed
- **Project Rollback:** Reverted from "Playful Discovery" (for ages 2-4) back to "Red Ball Classic - Arcade Escalator" (skill-based arcade game).
    - Updated `GAME_DESIGN.MD`, `ROADMAP.MD`, `TECHNICAL_DESIGN.MD`, `AI_INSTRUCTIONS.MD` to reflect the arcade game concept.
- **Heavily Refactored `app/(tabs)/paddle-game.tsx`:**
    - Game loop now manages arcade physics, brick collisions, scoring, game over, and level cleared states.
- **Updated Hooks:**
    - `useBall.ts`: Restored arcade speed logic, difficulty increase. Removed sparkle trail.
    - `usePaddle.ts`: Restored arcade-style hit animation.
    - `useGameSettings.ts`: Sound effect names updated for arcade context.
    - `GameOverlay.tsx`: Rewritten for "Tap to Start", "Game Over", and "Level Cleared" states with score display.
- All "Playful Discovery" specific UI elements, logic (gentle background changes, target interactions, sparkle trails) have been removed or reverted.

### Removed
- `hooks/useTargets.ts` and `components/game/TargetView.tsx` (related to "Playful Discovery").
- All specific code related to "Playful Discovery" features (gentle interactions, non-punitive resets, sparkle trails, gentle background changes).
- Previous `CHANGELOG.MD` entries specific to "Playful Discovery" features (now superseded by this rollback entry).

### Fixed
- Resolved TypeScript errors from previous development iteration.

## [Previous "Playful Discovery" Iteration - Now Superseded by Rollback]
*This section represents a branched effort that has been rolled back.*
*   Added "Playful Discovery" features (gentle ball/paddle, interactive targets, sparkle trail, background changes).
*   Updated GDD, Persona, Roadmap, Technical Design for "Playful Discovery".
*   (This work is no longer in the main line of development).

## [0.0.1] - 2025-05-10 (Active Development Version - Pre-"Playful Discovery" Pivot)
*This version reflects the original "Red Ball Classic - Arcade Escalator" concept.*
... (previous 0.0.1 entries remain as they were)