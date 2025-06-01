// File: docs/adrs/ADR-003-Paddle-Control-Implementation.md

# ADR-003: Paddle Control Implementation

*   **Status:** Approved
*   **Date:** 2025-05-11 (Assumed)
*   **Deciders:** DevLead

## Context and Problem Statement

"Red Ball Classic" requires players to control a horizontal paddle at the bottom of the screen. The control mechanism needs to be:
1.  Intuitive and responsive for mobile touch input.
2.  Performant, ensuring smooth paddle animation without lagging behind player input.
3.  Constrained within the game area boundaries.

## Considered Options

1.  **React Native PanResponder API:**
    *   Pros: Built-in to React Native for gesture handling.
    *   Cons: Can be more verbose to set up. Performance for continuous, high-frequency updates (like dragging a paddle) might be less optimal compared to dedicated gesture libraries, as updates typically go through the JS bridge.
2.  **`react-native-gesture-handler` + `react-native-reanimated`:**
    *   Pros:
        *   `react-native-gesture-handler` provides a more declarative and powerful API for handling complex gestures, running them primarily on the native thread for better performance.
        *   `react-native-reanimated` allows for animations to run on the UI thread, decoupled from the React JS thread, leading to smoother and more responsive animations, especially during gestures.
        *   `useSharedValue` and `useAnimatedStyle` provide an efficient way to update component styles directly from gesture events.
    *   Cons: Introduces two additional dependencies. Slightly higher learning curve compared to PanResponder for simple cases.
3.  **Direct Touch Events (`onTouchStart`, `onTouchMove`, `onTouchEnd`) on a View:**
    *   Pros: Basic, no extra libraries.
    *   Cons: Less sophisticated gesture recognition. Managing gesture state (tracking active touch, movement delta) becomes manual and error-prone. Performance can be an issue for smooth dragging as updates go through the JS bridge.

## Decision Outcome

**Chosen Option:** **`react-native-gesture-handler` (specifically `Gesture.Pan()`) combined with `react-native-reanimated` (specifically `useSharedValue` and `useAnimatedStyle`).**

**Justification:**

*   **Performance and Responsiveness:** This combination is the de facto standard in the React Native community for high-performance gesture-driven animations. Running gesture logic and animations on the native/UI thread minimizes the impact of JS thread congestion, resulting in a much smoother experience for the player, which is critical for a game relying on quick paddle movements.
*   **Developer Experience:** While slightly more complex initially, the declarative nature of `react-native-gesture-handler` and the power of Reanimated for direct style manipulation become advantageous for creating fluid interactions.
*   **Smooth Animation:** `useSharedValue` allows the paddle's translateX position to be updated directly in response to gesture events without triggering React re-renders for each frame of movement, which is essential for smoothness. `useAnimatedStyle` then applies this shared value to the paddle's style.
*   **Constraint Management:** Logic to clamp the paddle's position within the game area boundaries can be easily incorporated within the gesture handler's event callbacks.
*   **Future-Proofing:** Should more complex gestures or interactions be needed later, `react-native-gesture-handler` is well-equipped to handle them.

## Consequences

*   The project has dependencies on `react-native-gesture-handler` and `react-native-reanimated`. These must be correctly installed and configured (including native setup if not using Expo's pre-builds).
*   Paddle movement logic is implemented using:
    *   `Gesture.Pan()` from `react-native-gesture-handler` to detect drag gestures.
    *   `useSharedValue` from `react-native-reanimated` to store the animated horizontal position of the paddle (`paddleXShared`).
    *   An `onUpdate` callback in the pan gesture updates `paddleXShared.value`.
    *   `useAnimatedStyle` from `react-native-reanimated` creates a style object that applies the `translateX` transform based on `paddleXShared.value`.
    *   This animated style is applied to the `Animated.View` representing the paddle.
*   A separate React state variable (`paddleCurrentX`) is maintained via `runOnJS` from the gesture handler to provide the paddle's logical center position to the game loop for collision detection, as the game loop runs on the JS thread and cannot directly access shared values from the UI thread without such synchronization.
*   The root of the application (or at least the screen containing the gesture) needs to be wrapped in `<GestureHandlerRootView>`.