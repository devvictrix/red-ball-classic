// File: CHANGELOG.MD

# File: CHANGELOG.MD

# Changelog
...

## [Unreleased] - Red Ball Classic - Playful Discovery MVP

### Added
- **Project Pivot: "Red Ball Classic - Playful Discovery"** for ages 2-4.
    - New `GAME_DESIGN.MD` ("Playful Discovery") focused on gentle, exploratory play.
    - New `USER_PERSONA.MD` ("Playful Explorer") detailing the target 2-4 year old user.
    - Updated `ROADMAP.MD` to reflect "Playful Discovery" features.
    - Updated `AI_INSTRUCTIONS.MD` for the new game direction.
- **GDD-BALL-GENTLE:** Implemented very slow ball movement, gentle upward bounce from paddle, and a non-punitive reset mechanism (ball briefly hides then reappears) if missed.
- **GDD-PADDLE-GENTLE:** Implemented larger, friendly paddle with direct, smooth touch control. Added gentle squash animation on ball hit and scale feedback on touch.
- **GDD-TARGETS-INTRO:**
    - Added `TargetView.tsx` component for interactive targets.
    - Added `useTargets.ts` hook to manage target creation, positioning, and interaction.
    - Targets provide visual (animation) and haptic feedback on hit. When hit, targets "reset" by changing position/color/shape.
    - Added subtle idle pulse animation to targets in `TargetView.tsx`.
    - Enhanced target hit animation in `TargetView.tsx` for more "delight" (pop, wiggle, fade).
- **GDD-CONTINUOUS-PLAY:** Removed "Game Over" and "Level Cleared" states. Play is continuous.
- **GDD-UI-SIMPLE:**
    - `GameOverlay.tsx` simplified to show a large "Play" button to start.
    - `SettingsPanel.tsx` integrated into the start overlay for Haptics and Sound toggles. UI reviewed for clarity.
- **FR-UX-02-GENTLE:** Integrated gentle haptic feedback for paddle hits, target hits, and wall taps, controlled by user setting.
- **FR-UI-03-GENTLE:** Settings for Haptics and Sound can be toggled and persist via AsyncStorage (via `useGameSettings.ts`).
- **NFR-APPSTATE-01 (Adapted):** Game now gently pauses (shows start overlay) if app is backgrounded.
- New child-friendly color palettes in `constants/Colors.ts`, including arrays for gentle background transitions.
- Updated `constants/gameConstants.ts` with values suitable for gentle play (larger elements, slower speeds, constants for new features).
- New `docs/TECHNICAL_DESIGN.MD` written to reflect the architecture of "Playful Discovery."
- **Gentle Novelty Features:**
    - **Gentle Background Color Transition:** Game area background color now changes gently after a set number of target hits (`TARGET_HITS_FOR_BACKGROUND_CHANGE`).
    - **Simple "Happy Surprise" - Sparkly Ball Trail:** Ball temporarily leaves a soft sparkly trail after a set number of target hits (`TARGET_HITS_FOR_SPARKLE_TRAIL`), managed in `useBall.ts` and rendered by `BallView.tsx`.

### Changed
... // (Previous changes remain)

### Removed
... // (Previous removals remain)

### Fixed
... // (Previous fixes remain)
- Corrected syntax error in `hooks/useTargets.ts` related to variable naming.
- Resolved `PADDLE_WIDTH` scope issue in `app/(tabs)/paddle-game.tsx`.
- Corrected `useThemeColor` arguments in `components/game/SettingsPanel.tsx`.
- Deleted obsolete `hooks/useBricks.ts` and `components/game/BrickView.tsx`.

...