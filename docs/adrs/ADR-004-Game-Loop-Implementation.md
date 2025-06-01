// File: docs/adrs/ADR-004-Game-Loop-Implementation.md

# ADR-004: Game Loop Implementation

*   **Status:** Approved
*   **Date:** 2025-05-11 (Assumed)
*   **Deciders:** DevLead

## Context and Problem Statement

"Red Ball Classic" requires a continuous game loop to:
1.  Update the ball's position based on its velocity.
2.  Detect and handle collisions (ball-wall, ball-paddle).
3.  Check for game over conditions.
4.  Update the score.
5.  Trigger visual and audio feedback.

This loop needs to run smoothly and efficiently to provide a good player experience, ideally synchronizing with the device's screen refresh rate.

## Considered Options

1.  **`setInterval`:**
    *   Pros: Simple JavaScript API for repeated execution.
    *   Cons: Not synchronized with the browser's/device's rendering pipeline. Can lead to choppy animations or inconsistent timing, especially if the JS thread is busy. Not ideal for game loops.
2.  **`requestAnimationFrame` (rAF):**
    *   Pros: Specifically designed for animations. The browser/OS calls the provided callback function right before the next screen repaint. This leads to smoother animations and more efficient resource usage (e.g., it pauses when the tab/app is not visible).
    *   Cons: The callback needs to recursively call `requestAnimationFrame` to continue the loop.
3.  **`useEffect` Hook with `requestAnimationFrame`:**
    *   Pros: Integrates `requestAnimationFrame` into the React component lifecycle. The `useEffect` hook can manage the starting and stopping of the game loop based on a dependency (e.g., `isGameActive`).
    *   Cons: Requires careful management of the `useEffect` dependencies and cleanup function to avoid memory leaks or unintended behavior.
4.  **Dedicated Game Loop Library (e.g., from a game engine):**
    *   Pros: Often provide more sophisticated features like fixed time steps, interpolation, and easier management of game entities.
    *   Cons: Introduces a larger dependency, potentially overkill for a simple game. Might not integrate as seamlessly with React's rendering model if not designed for it.

## Decision Outcome

**Chosen Option:** **`useEffect` Hook with `requestAnimationFrame`**

**Justification:**

*   **Smoothness and Efficiency:** `requestAnimationFrame` is the standard and most performant way to create animation loops in JavaScript environments, including React Native. It synchronizes updates with the device's display refresh cycle.
*   **React Integration:** Using `useEffect` allows the game loop to be tied to the React component's lifecycle and state. The loop can be started when `isGameActive` becomes true and cleaned up (by cancelling the rAF call) when `isGameActive` becomes false or the component unmounts. This is a clean way to manage the loop's lifecycle.
*   **Control:** This approach provides fine-grained control over what happens in each frame of the game.
*   **No Extra Dependencies for the Loop Itself:** `requestAnimationFrame` is a global browser/React Native API.
*   **Frame-Rate Independence (Potential):** While the current `game.tsx` implementation uses fixed velocity increments per frame, a `requestAnimationFrame`-based loop can easily be adapted to use delta time for frame-rate independent physics if needed in the future. The timestamp provided by `requestAnimationFrame` can be used for this.

## Consequences

*   A `useEffect` hook in `GameScreen` (`app/(tabs)/game.tsx`) is responsible for the game loop.
    *   Its dependency array includes `isGameActive`, `ballPosition`, `ballVelocity`, `gameAreaDimensions`, `paddleCurrentX`, etc., to re-run or correctly capture these values in its closure.
    *   It starts the loop when `isGameActive` is true.
*   Inside the `useEffect` callback, a function (e.g., `gameLoopLogic`) is defined. This function:
    *   Calculates the new ball position.
    *   Performs collision detection.
    *   Updates game state (ball position, velocity, score) using their respective `set` functions from `useState`.
    *   Recursively calls `requestAnimationFrame(gameLoopLogic)` to schedule the next frame.
*   A `useRef` (e.g., `animationFrameId.current`) stores the ID returned by `requestAnimationFrame` so it can be cancelled by `cancelAnimationFrame` in the `useEffect`'s cleanup function or when `isGameActive` turns false.
*   All state updates that trigger UI re-renders (like `setBallPosition`) are called within this loop. Updates to shared values for Reanimated or calls like `runOnJS` are also managed here.
*   Care must be taken with the `useEffect` dependency array to ensure the loop behaves correctly and doesn't cause stale closures or infinite loops.