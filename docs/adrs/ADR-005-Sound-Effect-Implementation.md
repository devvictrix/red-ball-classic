// File: docs/adrs/ADR-005-Sound-Effect-Implementation.md

# ADR-005: Sound Effect Implementation

*   **Status:** Approved
*   **Date:** 2025-05-12 (Assumed)
*   **Deciders:** DevLead

## Context and Problem Statement

To enhance player engagement in "Red Ball Classic" (`FR-UX-01`), we need to implement sound effects for key game events, such as:
1.  Ball bouncing off walls.
2.  Ball bouncing off the player's paddle.
3.  Game over event.

The chosen solution should be relatively easy to integrate with Expo and manage sound assets.

## Considered Options

1.  **`expo-av`:**
    *   Pros: Part of the Expo SDK, providing a comprehensive API for audio (and video) playback. Supports loading sounds from local assets, managing playback (play, pause, stop, replay), and configuring audio modes. Well-documented for Expo projects.
    *   Cons: Requires managing `Audio.Sound` object instances. Asynchronous operations for loading and playing need to be handled.
2.  **`react-native-sound`:**
    *   Pros: Popular third-party library for sound playback in React Native.
    *   Cons: Requires linking for native modules if not using Expo's pre-build system, potentially adding complexity. Might have different API patterns than Expo-specific libraries.
3.  **HTML5 Audio (for Web target only):**
    *   Pros: Native browser API for web.
    *   Cons: Not applicable for native iOS/Android builds, requiring a separate solution or conditional logic.

## Decision Outcome

**Chosen Option:** **`expo-av`** (specifically `Audio.Sound`)

**Justification:**

*   **Expo Integration:** As "Red Ball Classic" is an Expo project, using `expo-av` is the most straightforward and integrated solution. It's designed to work seamlessly within the Expo ecosystem.
*   **Comprehensive API:** `expo-av` provides all necessary functionalities:
    *   Loading sound files (e.g., `.mp3`, `.wav`) from `assets` using `require`.
    *   Creating `Audio.Sound` objects.
    *   Controlling playback (`playAsync`, `replayAsync`, `stopAsync`, `unloadAsync`).
    *   Setting audio session modes (e.g., `playsInSilentModeIOS`, `interruptionModeIOS`, `interruptionModeAndroid`) for better cross-platform behavior.
*   **Asset Handling:** Expo's asset bundling system works well with `require` for local sound files.
*   **Sufficient for Needs:** For playing simple, short sound effects, `expo-av` is more than capable.
*   **Cross-Platform (within Expo's scope):** `expo-av` aims to provide a consistent audio API across iOS, Android, and Web where supported by underlying platform capabilities.

## Consequences

*   The project has a dependency on `expo-av`.
*   Sound files (e.g., `bounce.mp3`, `game_over.mp3`) are stored in the `assets/sounds/` directory.
*   In `GameScreen` (`app/(tabs)/game.tsx`):
    *   `useRef` is used to store instances of loaded `Audio.Sound` objects (e.g., `bounceSound.current`, `gameOverSound.current`).
    *   A `useEffect` hook is used on component mount to:
        *   Configure the global audio mode using `Audio.setAudioModeAsync`.
        *   Load sound assets using `Audio.Sound.createAsync(require('path/to/sound.mp3'))`.
        *   Store the sound objects in their respective refs.
    *   A cleanup function in the `useEffect` hook unloads sounds using `sound.unloadAsync()` when the component unmounts to free resources.
    *   A helper function `playSound(soundRef)` is created to encapsulate the logic for replaying a sound (e.g., `soundRef.current?.replayAsync()`). This function is called using `runOnJS` from the game loop or Reanimated event handlers where necessary.
*   Error handling (e.g., `try-catch`) is implemented around sound loading and playback operations.
*   The `soundsLoaded.current` ref is used to ensure sounds are only loaded once.