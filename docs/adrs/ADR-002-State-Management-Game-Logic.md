// File: docs/adrs/ADR-002-State-Management-Game-Logic.md

# ADR-002: State Management for Game Logic

*   **Status:** Approved
*   **Date:** 2025-05-11 (Assumed)
*   **Deciders:** DevLead

## Context and Problem Statement

"Red Ball Classic" requires managing various pieces of game state, including:
*   Ball position and velocity.
*   Paddle position (logical, for collision).
*   Current score and high score.
*   Game status (e.g., not started, active, game over).
*   Game area dimensions.

This state needs to be updated frequently within the game loop and trigger UI re-renders when necessary. We need a clear and efficient approach to state management within the React Native component (`GameScreen`).

## Considered Options

1.  **React Hooks (`useState`, `useRef`, `useReducer`):**
    *   Pros: Built-in to React, familiar to React developers. `useState` is simple for independent state variables. `useRef` is good for mutable values not triggering re-renders (like animation IDs or sound objects). `useReducer` can be useful for more complex state transitions.
    *   Cons: For highly interconnected state or very complex logic, managing many `useState` calls can become verbose. Prop drilling might occur if state needs to be shared deeply (less of an issue for a single-screen game).
2.  **External State Management Libraries (e.g., Redux, Zustand, Jotai):**
    *   Pros: Provide centralized stores, well-defined patterns for state updates (actions, reducers, selectors), and often better performance characteristics for large-scale applications.
    *   Cons: Adds external dependencies. Can be overkill and introduce unnecessary boilerplate for a relatively simple single-screen game like "Red Ball Classic." Steeper learning curve if unfamiliar.
3.  **Class Component with `this.state`:**
    *   Pros: Traditional React state management.
    *   Cons: Functional components with Hooks are now the more common and often preferred approach in modern React development.

## Decision Outcome

**Chosen Option:** **React Hooks (`useState` for UI-triggering state, `useRef` for non-UI-triggering mutable values)**

**Justification:**

*   **Simplicity and Sufficiency:** For the current scope of "Red Ball Classic," which is largely contained within a single game screen (`GameScreen`), React's built-in Hooks (`useState`, `useRef`) provide a straightforward and sufficient mechanism for managing game state.
    *   `useState` is used for data that, when changed, should cause the component to re-render (e.g., `ballPosition`, `score`, `isGameActive`, `isGameOver`, `gameAreaDimensions`).
    *   `useRef` is used for values that need to persist across renders but whose changes should not directly cause a re-render (e.g., `animationFrameId.current`, `bounceSound.current`, `paddleOffsetX.value`'s conceptual equivalent in some contexts if not using Reanimated for it).
*   **Alignment with Modern React:** Using Hooks aligns with current best practices in React development.
*   **No Unnecessary Dependencies:** Avoids adding external state management libraries, keeping the project lighter.
*   **Developer Familiarity:** Hooks are a core part of React, making the state logic accessible to developers familiar with the framework.
*   **Performance:** For the number of state variables and update frequency in this game, React's default reconciliation with Hooks is performant enough. Reanimated's `useSharedValue` is used for animation-critical state like paddle position, offloading that from the React render cycle for optimal performance.

If the game were to grow significantly in complexity with many interconnected states or multiple screens deeply sharing complex state, reconsidering a more robust solution like Zustand or Jotai (which are generally lighter than Redux) might be warranted. For now, Hooks are the most pragmatic choice.

## Consequences

*   Game state logic (ball position, velocity, score, game status) is managed within `GameScreen` using `useState`.
*   Mutable references not intended to trigger re-renders (e.g., animation frame IDs, sound object instances) are managed using `useRef`.
*   Functions that update state (e.g., `setBallPosition`, `setScore`) are defined within `GameScreen` and often passed to or called from the game loop or event handlers.
*   For animations directly tied to gestures or frequent updates (like paddle movement), Reanimated's `useSharedValue` is used to bypass React's render cycle, with `runOnJS` used to synchronize back to React state when necessary (e.g., updating `paddleCurrentX` for collision logic).