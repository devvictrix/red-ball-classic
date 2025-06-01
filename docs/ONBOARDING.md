// File: docs/ONBOARDING.md

# Welcome to the Red Ball Classic Team!

We're excited to have you on board to help develop "Red Ball Classic"! This document will guide you through the project, its current state, and how you can get started contributing.

## 1. Project Overview

**"Red Ball Classic"** is an arcade-style brick-breaker game built with **React Native and Expo**. The current vision for the game is **"Arcade Escalator,"** focusing on:

*   **Relentless, Escalating Challenge:** The game gets progressively harder as the player's score increases (e.g., faster ball, more complex brick layouts).
*   **Core Brick-Breaker Mechanics:** Classic paddle, ball, and breakable bricks.
*   **Skill-Based Gameplay:** Rewarding player precision, reflexes, and strategy.
*   **Engaging "Just One More Try" Loop:** Designed to be addictive and fun.

The game targets iOS, Android, and Web. For a deep dive into the game's concept, mechanics, and design, please refer to:
*   `docs/GAME_DESIGN.MD` (Specifically the "Arcade Escalator" details)
*   `docs/TARGET_AUDIENCE.MD`

## 2. Getting Started

Follow these steps to set up your development environment:

**Prerequisites:**
*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   `npm` (comes with Node.js) or `yarn`
*   [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
*   [Git](https://git-scm.com/)
*   An iOS simulator (via Xcode on macOS) or Android emulator (via Android Studio) for mobile development.

**Setup Steps:**
1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd red-ball-classic
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Run the Application:**
    ```bash
    npm start
    # or
    # expo start
    ```
    This will open the Expo Developer Tools in your browser. From there, you can:
    *   Press `i` to open on an iOS simulator.
    *   Press `a` to open on an Android emulator/device.
    *   Press `w` to open in a web browser.

4.  **Generating Sound Assets (If needed):**
    The project includes a script to decode base64 encoded sound files into `assets/sounds/`. If new sounds are added in this format, you might need to run:
    ```bash
    node decode_base64_to_file.js
    ```
    This is typically a utility script for managing sound assets.

## 3. Project Structure

Here's an overview of the key directories and files:

*   `app/`: Contains all screens and navigation logic, powered by Expo Router.
    *   `(tabs)/`: Defines the tab-based navigation.
        *   `paddle-game.tsx`: **The core game screen.** Contains the main game logic, state management, and renders all game elements.
        *   `explore.tsx`: An example screen (may be removed or repurposed).
        *   `index.tsx`: The home screen.
        *   `_layout.tsx`: Configures the tab navigator, including icons and tab bar appearance.
    *   `_layout.tsx`: Root layout for the app. Handles global providers like `ThemeProvider` and loads custom fonts.
    *   `+not-found.tsx`: Screen for handling unknown routes.
*   `assets/`: Static files.
    *   `fonts/`: Custom fonts (e.g., SpaceMono).
    *   `images/`: App icons, logos, and other image assets.
    *   `sounds/`: Sound effect files (e.g., `.wav`). (Note: Sound playback is currently behind a feature flag).
*   `components/`: Reusable React components.
    *   `game/`: Components specifically for the game UI.
        *   `BallView.tsx`: Renders the game ball.
        *   `BrickView.tsx`: Renders individual bricks.
        *   `GameOverlay.tsx`: Displays messages like "Tap to Start," "Game Over," "Level Cleared," and game settings.
        *   `PaddleView.tsx`: Renders the player-controlled paddle.
        *   `SettingsPanel.tsx`: UI for toggling game settings (haptics, sound).
    *   `ui/`: General UI elements.
        *   `IconSymbol.tsx` & `IconSymbol.ios.tsx`: Cross-platform icon component.
        *   `TabBarBackground.tsx` & `TabBarBackground.ios.tsx`: Custom tab bar background.
    *   `Collapsible.tsx`, `ExternalLink.tsx`, `HelloWave.tsx`, `ParallaxScrollView.tsx`, `ThemedText.tsx`, `ThemedView.tsx`: General purpose UI components.
*   `constants/`: Global constants for the application.
    *   `Colors.ts`: Defines color palettes for light and dark themes, including specific "arcade" colors for game elements.
    *   `gameConstants.ts`: Crucial values for game mechanics (ball size, paddle dimensions, speeds, brick layout, scoring, etc.). **Familiarize yourself with these.**
*   `docs/`: Project documentation (you are here!).
    *   `adrs/`: Architectural Decision Records. These explain *why* certain technical choices were made.
    *   `GAME_DESIGN.MD`: **Essential reading.** Details the "Arcade Escalator" vision, game mechanics, difficulty scaling, and player experience.
    *   `ROADMAP.MD` & `FEATURE_ROADMAP.MD`: Outlines completed, ongoing, and planned features. Includes important development flags.
    *   `TECHNICAL_DESIGN.MD`: Describes the technical architecture and implementation details of game systems.
    *   `AI_INSTRUCTIONS.MD`: Guidelines for AI collaboration on the project.
    *   `TARGET_AUDIENCE.MD`: Describes the intended players for the game.
*   `hooks/`: Custom React Hooks encapsulating specific logic.
    *   `useBall.ts`: Manages ball physics, movement, and difficulty-related speed scaling.
    *   `useBricks.ts`: Manages the state of all bricks (creation, destruction, layout).
    *   `useGameDimensions.ts`: Determines the playable game area size dynamically.
    *   `useGameSettings.ts`: Handles game settings like haptics and sound (persistence and toggling).
    *   `usePaddle.ts`: Manages paddle movement (via gestures), animation, and logical position.
    *   `useScore.ts`: Tracks current score and high score (including persistence).
    *   `useThemeColor.ts`: Utility hook for applying themed colors.
    *   `useColorScheme.ts` & `useColorScheme.web.ts`: Detects light/dark mode.
*   `scripts/`: Utility scripts.
    *   `reset-project.js`: Resets the project to a blank slate (use with caution).
    *   `decode_base64_to_file.js`: Decodes base64 sound data to files.
*   `.expo/`: Files generated by Expo. Generally, you don't need to edit these.
*   `eas.json`: Configuration for Expo Application Services (EAS) builds.
*   `eslint.config.js`: ESLint (linter) configuration.
*   `package.json`: Lists project dependencies and scripts.
*   `tsconfig.json`: TypeScript compiler configuration.

## 4. Core Technologies

The project leverages several key technologies:

*   **React Native:** The fundamental framework for building cross-platform native apps with JavaScript/TypeScript and React.
*   **Expo SDK:** A platform and toolset built around React Native that simplifies development, building, and deployment.
*   **Expo Router:** A file-system based routing library for React Native and web apps, used for navigation between screens (e.g., tabs).
*   **TypeScript:** Used throughout the project for static typing, improving code quality and maintainability.
*   **React Native Gesture Handler:** Provides high-performance, native-driven touch gesture recognition, crucial for smooth paddle control.
*   **React Native Reanimated:** A powerful library for creating fluid, performant animations that run on the native UI thread. Used for paddle movement, ball effects, and UI transitions.
*   **`expo-av`:** Expo's audio/video module, used for loading and playing sound effects (playback currently conditional).
*   **`@react-native-async-storage/async-storage`:** For persisting simple data locally, like the high score.
*   **`expo-haptics`:** Provides access to native haptic feedback.

## 5. Key Game Systems & Logic

The primary game logic is orchestrated within `app/(tabs)/paddle-game.tsx`, which utilizes various custom hooks and components.

### 5.1. Main Game Screen (`app/(tabs)/paddle-game.tsx`)
*   **Orchestration Hub:** Initializes and coordinates all game-related custom hooks (`useBall`, `usePaddle`, `useBricks`, `useScore`, `useGameDimensions`, `useGameSettings`).
*   **Game State Management:** Manages core game states like `isGameActive`, `isGameOverState`, `levelCleared`, and `hasGameBeenInitialized` using `useState`.
*   **Game Loop:** Implements the main game loop within a `useEffect` hook, using `requestAnimationFrame` for smooth updates. This loop:
    *   Updates ball position.
    *   Detects collisions (ball-wall, ball-paddle, ball-brick).
    *   Updates score.
    *   Checks for game over or level cleared conditions.
    *   Triggers haptic feedback and sound effects.
*   **Event Handling:** Contains functions like `startGame`, `performGameOver`, `performLevelCleared` to manage transitions between game states.
*   **Rendering:** Renders the game area and all visual elements (ball, paddle, bricks, overlays) using components from `components/game/`.

### 5.2. Custom Hooks (`hooks/*.ts`)
*   **`useBall.ts`:**
    *   State: `ballPosition`, `ballVelocity`.
    *   Logic: `resetBall` (initial position/speed), `updateVelocityOnPaddleHit` (calculates rebound angle/speed), `increaseDifficulty` (scales ball speed based on score, a core part of "Arcade Escalator").
*   **`useBricks.ts`:**
    *   State: Array of `bricks` (each with position, size, active status, color).
    *   Logic: `initializeBricks` (creates the grid), `handleBrickHit` (marks brick inactive), `allBricksCleared` (checks for level completion), `resetBricks` (for new levels/waves).
*   **`usePaddle.ts`:**
    *   State: `paddleXShared` (Reanimated shared value for animated X position), `paddleCurrentLogicalX` (for collision logic).
    *   Logic: Implements paddle control via `Gesture.Pan()` from `react-native-gesture-handler`. `animatedPaddleStyle` for Reanimated. `resetPaddle` for initial positioning. `triggerPaddleHitAnimation` for visual feedback.
*   **`useScore.ts`:**
    *   State: `score`, `highScore`.
    *   Logic: `incrementScoreBy`, `resetScore`, `checkAndSaveHighScore` (loads/saves high score from/to AsyncStorage).
*   **`useGameDimensions.ts`:**
    *   State: `gameAreaDimensions` (width, height, x, y of the playable area).
    *   Logic: `handleLayout` callback to dynamically calculate dimensions based on screen size and `GAME_ASPECT_RATIO_VALUE`.
*   **`useGameSettings.ts`:**
    *   State: `hapticsEnabled`, `soundEnabled` (persisted in AsyncStorage).
    *   Logic: `toggleHaptics`, `toggleSound`, `triggerHapticFeedback`, `playSoundEffect` (currently logs sound events; actual playback depends on `ENABLE_SOUND_FEATURES_MVP` flag in `paddle-game.tsx` which is `false`).
*   **`useThemeColor.ts` & `useColorScheme.ts`:**
    *   Work together to provide colors based on the user's light/dark mode preference, using palettes from `constants/Colors.ts`.

### 5.3. Game Components (`components/game/*.tsx`)
*   **`BallView.tsx`:** Renders the ball at its current `position`.
*   **`BrickView.tsx`:** Renders a single brick if it's `isActive`.
*   **`PaddleView.tsx`:** Renders the paddle using `animatedStyle` from `usePaddle` and attaches the `panGesture`.
*   **`GameOverlay.tsx`:** Conditionally renders different UI overlays based on game state:
    *   Initial "Tap to Start" screen.
    *   "Game Over" screen with score and play again option.
    *   "Level Cleared" screen with score and next level option.
    *   Includes the `SettingsPanel`.
*   **`SettingsPanel.tsx`:** Provides UI (switches) to toggle haptics and sound. The sound toggle's visibility is controlled by `showSoundToggle` prop.

### 5.4. Game Constants (`constants/`)
*   **`gameConstants.ts`:** This file is critical. It defines numerical parameters for nearly every aspect of gameplay: ball size, paddle dimensions, initial speeds, speed increment logic, brick layout (rows, columns, padding, offsets), scoring values, etc. Changes here directly impact game balance and feel.
*   **`Colors.ts`:** Defines themed color palettes (light/dark) including specific colors for game elements (ball, paddle, bricks, backgrounds) under "Arcade" or "Arcade Neon" themes.

## 6. Workflow & Conventions

*   **Architectural Decisions:** Refer to files in `docs/adrs/` to understand the reasoning behind key technical choices.
*   **Feature Development:**
    *   Features are guided by `docs/GAME_DESIGN.MD`.
    *   Progress is tracked in `docs/ROADMAP.MD` (or `docs/FEATURE_ROADMAP.MD`). Please update this when tasks are completed.
    *   Note the **Development Flags** in `docs/FEATURE_ROADMAP.MD` (e.g., `Enable Sound Features for v1.0.0 MVP`). The `paddle-game.tsx` file also has `ENABLE_SOUND_FEATURES_MVP = false`, which controls sound-related UI and logic.
*   **TypeScript:** All new code should be written in TypeScript. Strive for strong typing.
*   **Code Style:** Follow existing code patterns. ESLint (`npm run lint`) is configured to help maintain consistency.
*   **Modularity:** Logic is often encapsulated in custom hooks. Components are kept focused on rendering.
*   **Git:** Use feature branches for new development. Write clear commit messages.

## 7. Important Project Documents

Please take the time to read these documents thoroughly:

*   `docs/GAME_DESIGN.MD`: The **primary specification** for game mechanics, features, and the "Arcade Escalator" vision.
*   `docs/ROADMAP.MD` / `docs/FEATURE_ROADMAP.MD`: Understand what's been done, what's in progress, and what's planned.
*   `docs/TECHNICAL_DESIGN.MD`: Provides a higher-level overview of the technical implementation.
*   `docs/adrs/`: Key architectural decisions.

## 8. Current Focus & Next Steps (Arcade Escalator MVP)

As per `docs/ROADMAP.MD`, the immediate focus is on delivering the v1.0.0 MVP of the "Arcade Escalator." Key tasks you might be involved in or should be aware of:

1.  **`FR-OBSTACLES-01` (Basic Breakable Bricks):**
    *   Ensure `useBricks.ts` correctly initializes a grid of standard, single-hit bricks.
    *   Verify `BrickView.tsx` renders these bricks based on their state.
    *   Implement/Refine ball-brick collision detection logic in `app/(tabs)/paddle-game.tsx`.
    *   When a ball hits a brick: mark the brick inactive, award score (`BRICK_SCORE_VALUE`), and handle ball rebound.
    *   Implement "Level Cleared" state transition (via `performLevelCleared`) when `allBricksCleared()` returns true. This should then allow the player to start a new wave of bricks.

2.  **`FR-LEVELS-01` (Difficulty Progression - Ball Speed):**
    *   Review and test the `increaseDifficulty` function in `hooks/useBall.ts`. This function should increase the ball's speed components based on `currentScore` and constants like `SPEED_INCREMENT`, `SCORE_THRESHOLD_FOR_SPEED_INCREASE`, and `MAX_BALL_SPEED_COMPONENT`.

3.  **`FR-UX-02` (Enhanced Haptic Feedback) & `FR-UI-03` (Basic Settings Screen):**
    *   The `SettingsPanel` and `useGameSettings` hook provide toggles for haptics (and sound). Ensure haptic feedback is triggered appropriately for game events (paddle hits, wall hits, brick breaks, game over, level clear, UI interactions) and respects the user's setting.

4.  **`NFR-PERF-01` (Performance Optimization Review) & `NFR-CODE-01` (Code Refactoring & Cleanup):**
    *   Be mindful of performance, especially in the game loop and animations.
    *   Look for opportunities to refactor `app/(tabs)/paddle-game.tsx` or other areas for better clarity, modularity, and maintainability. This might involve creating new custom hooks or further breaking down components.

## 9. Communication & Asking Questions

We're a team, and communication is key!
*   If anything is unclear, please ask.
*   For technical questions, gameplay clarifications, or design discussions, reach out to the DevLead or other team members.
*   Use project management tools/communication channels as established by the team.

We're looking forward to your contributions to "Red Ball Classic"! Welcome aboard!