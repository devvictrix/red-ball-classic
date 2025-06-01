// File: docs/TECHNICAL_DESIGN.MD
# Technical Design Document: Red Ball Classic - Arcade Escalator

This document outlines the technical design and architectural considerations for the "Red Ball Classic" game, built with React Native and Expo. It reflects decisions made in Architectural Decision Records (ADRs) and the intended implementation for an arcade-style brick-breaker game with escalating difficulty.

## 1. Core Architecture (React Native & Expo)

The game is primarily contained within the `app/(tabs)/paddle-game.tsx` file, functioning as a single-screen application within the Expo Router tab-based navigation.

*   **Main Game Component (`PaddleGameScreen` in `app/(tabs)/paddle-game.tsx`):**
    *   A React functional component responsible for rendering the entire game UI and managing game logic.
    *   Utilizes React Hooks (`useState`, `useEffect`, `useRef`, `useCallback`) for state management, side effects, and memoization.
    *   Integrates `react-native-gesture-handler` for paddle input and `react-native-reanimated` for animations.
*   **State Management (ADR-002):**
    *   **Game Logic State:** Managed via `useState` (e.g., `ballPosition`, `ballVelocity`, `score`, `highScore`, `isGameActive`, `isGameOver`, `levelCleared`, `gameAreaDimensions`, `bricks`).
    *   **Animation State:** `useSharedValue` from `react-native-reanimated` for paddle position (`paddleXShared`) and visual effects (`paddleScale`, `tapToStartOpacity`, `gameOverScale`).
    *   **Refs:** `useRef` for mutable values that don't trigger re-renders (e.g., `animationFrameId`, sound object references, `appState`).
*   **Rendering:**
    *   Standard React Native `View` components are used to represent the game area, ball, paddle, and bricks.
    *   Styles are defined using `StyleSheet.create()`.
    *   Dynamic styling for light/dark modes is handled by the `useThemeColor` hook and arcade-themed `Colors.ts`.
*   **Game Loop (ADR-004):**
    *   Implemented within a `useEffect` hook that depends on `isGameActive`.
    *   Uses `requestAnimationFrame` for smooth, screen-refresh-synchronized updates of ball position, physics, and game logic.
*   **Layout and Responsiveness:**
    *   `useGameDimensions` hook and `onLayout` dynamically determine game area dimensions.
    *   Game elements are sized and positioned relative to these dynamic dimensions.
    *   The game maintains a fixed aspect ratio (`GAME_ASPECT_RATIO_VALUE`).
    *   For web, a fixed width (`WEB_GAME_AREA_WIDTH`) is used.
*   **Asset Management:**
    *   Sound files (e.g., `.mp3`, `.wav`) in `assets/sounds/`, loaded using `expo-av` (or `expo-audio`).
    *   Image assets (e.g., icons) in `assets/images/`.

## 2. Key Libraries & Justifications (Summary from ADRs)

*   **Core Framework:** React Native with Expo (ADR-001).
*   **State Management (Game Logic):** React Hooks (`useState`, `useEffect`, `useRef`) (ADR-002).
*   **Paddle Control & Animation:** `react-native-gesture-handler` and `react-native-reanimated` (ADR-003).
*   **Game Loop:** `useEffect` + `requestAnimationFrame` (ADR-004).
*   **Sound Effects:** `expo-av` (or `expo-audio`) (ADR-005).
*   **High Score Persistence:** `@react-native-async-storage/async-storage` (ADR-006).
*   **UI Theming:** `useColorScheme` hook, `Colors.ts`, `useThemeColor` utility (ADR-007).
*   **Navigation:** `expo-router`.

## 3. Game Element Implementation

### 3.1. Game Area (`View` in `PaddleGameScreen`)

*   A `View` component styled with borders and background color.
*   `onLayout` (via `useGameDimensions`) captures its dimensions.
*   Maintains `GAME_ASPECT_RATIO_VALUE`.

### 3.2. Ball (`BallView.tsx`, `useBall.ts`)

*   A `View` styled as a circle (`BALL_RADIUS`).
*   Position (`left`, `top`) derived from `ballPosition` state.
*   Movement logic in `useBall.ts`:
    *   `ballPosition` updated in game loop based on `ballVelocity`.
    *   Speed increases with score via `increaseDifficulty` function.
    *   Collision with walls inverts respective velocity component.

### 3.3. Paddle (`PaddleView.tsx`, `usePaddle.ts`)

*   An `Animated.View` component for smooth movement.
*   Horizontal position controlled by `paddleXShared` (Reanimated `useSharedValue`) via `Gesture.Pan()`.
*   Visual feedback on hit: `paddleScale` shared value animation.

### 3.4. Bricks (`BrickView.tsx`, `useBricks.ts`)

*   `BrickView` renders individual bricks as `View` components.
*   `useBricks.ts` hook manages the state of all bricks:
    *   `initializeBricks`: Creates a grid of bricks (e.g., `BRICK_ROW_COUNT` x `BRICK_COLUMN_COUNT`). Each brick has `x, y, width, height, isActive, color, id`.
    *   `handleBrickHit`: Called on collision. Sets `isActive` to `false` for the hit brick.
    *   `allBricksCleared`: Checks if all bricks are inactive.
    *   `resetBricks`: Re-initializes bricks for a new level/wave.
*   Brick dimensions calculated based on game area width and `BRICK_COLUMN_COUNT`, `BRICK_PADDING`.

## 4. Game Logic Systems

### 4.1. Game Loop (`useEffect` in `PaddleGameScreen`)

*   Manages updates when `isGameActive` is true.
*   Updates ball position, performs collision detection (ball-wall, ball-paddle, ball-brick).
*   Updates `ballVelocity` upon collision.
*   Calls `increaseDifficulty` from `useBall` based on score.
*   Checks for game over (`isGameOver`) or level cleared (`levelCleared`) conditions.
*   Triggers sound effects and haptics.

### 4.2. Collision Detection & Response

*   **Ball-Wall:** Inverts ball's `dx` or `dy`.
*   **Ball-Paddle:**
    *   Inverts `ballVelocity.dy`.
    *   Adjusts `ballVelocity.dx` based on hit position on paddle for variable bounce angles.
    *   Increments score by 1.
    *   Triggers paddle animation.
*   **Ball-Brick:**
    *   Iterate through active bricks.
    *   Check for intersection between ball's bounding box and brick's bounding box.
    *   If collision:
        *   Call `handleBrickHit` from `useBricks` for the specific brick ID.
        *   Increment score by `BRICK_SCORE_VALUE`.
        *   Determine bounce direction (inve`rt dx` or `dy` based on hit side). A common simplification is to always invert `dy`, or determine if hit was more horizontal or vertical.
        *   Trigger haptic/sound feedback.

### 4.3. Scoring System (`useScore.ts`)

*   `score` and `highScore` managed by `useState`.
*   `incrementScoreBy(points)`: Updates current score.
*   `resetScore()`: Sets score to 0.
*   `checkAndSaveHighScore()`: Compares score with highScore, saves to AsyncStorage if greater (ADR-006).
*   Score awarded for paddle hits and breaking bricks.

### 4.4. Game State Management (`PaddleGameScreen`)

*   `isGameActive` (boolean): Controls game loop.
*   `isGameOverState` (boolean): True if ball missed.
*   `levelCleared` (boolean): True if `allBricksCleared()` is true.
*   These states control UI overlays (`GameOverlay.tsx`) for "Tap to Start", "Game Over", "Level Cleared".
*   **`startGame` function:** Resets ball/paddle/bricks, score (unless continuing), sets `isGameActive=true`, `isGameOverState=false`, `levelCleared=false`.
*   **`handleGameOver` function:** Sets `isGameActive=false`, `isGameOverState=true`, saves high score.
*   **`handleLevelCleared` function:** Sets `isGameActive=false`, `levelCleared=true`. Prompts to start next level (which calls `startGame` and potentially increases brick difficulty in `useBricks`).
*   **App State Handling:** Pauses game if app backgrounds.

## 5. Audio System (ADR-005)

*   Uses `expo-av` (or `expo-audio`).
*   Sound assets loaded asynchronously.
*   Functions to play sounds for wall bounce, paddle hit, brick break, game over, level clear, UI clicks.
*   Playback controlled by `soundEnabled` setting from `useGameSettings`.

## 6. Theming and Styling (ADR-007)

*   `Colors.ts` defines arcade-style color palettes for light/dark modes.
*   `useThemeColor` hook for dynamic colors.
*   Platform-specific shadow styles for depth.

## 7. Error Handling & Logging

*   Basic `try-catch` for AsyncStorage, sound loading.
*   `console.error` or `console.warn` for logging.

## 8. Web-Specific Considerations

*   Fixed game area width. Standard React Native Web compatibility.

## 9. Potential Future Enhancements (Technical Perspective - Arcade)

*   **Frame-Rate Independent Game Loop:** Delta time for consistent physics.
*   **Advanced Brick Types:** Logic in `useBricks` for multi-hit, indestructible, or special effect bricks.
*   **Power-Up System:** Logic to spawn, collect, and apply effects of power-ups.
*   **More Sophisticated Collision:** Pixel-perfect or more accurate geometric collision if needed.