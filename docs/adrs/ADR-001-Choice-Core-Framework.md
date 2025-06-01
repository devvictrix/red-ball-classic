// File: docs/adrs/ADR-001-Choice-Core-Framework.md

# ADR-001: Choice of Core Framework for Red Ball Classic

*   **Status:** Approved
*   **Date:** 2025-05-10 (Assumed based on project pivot)
*   **Deciders:** DevLead

## Context and Problem Statement

The project "Red Ball Classic" aims to develop a simple, cross-platform mobile arcade game. An initial HTML/CSS/JS prototype ("บาร์เด้งบอล") demonstrated the core concept. We need to select a robust and efficient framework for building the full game, targeting iOS, Android, and potentially Web, with a good developer experience.

## Considered Options

1.  **Continue with HTML/CSS/JS (e.g., with a library like Phaser, or vanilla Canvas):**
    *   Pros: Familiarity from prototype, good for web. Phaser provides game-specific features.
    *   Cons: Native mobile deployment requires wrappers (Cordova, Capacitor) which can have performance overhead and native API access limitations. Vanilla Canvas for a full game can be complex to manage.
2.  **Native Development (Swift/Kotlin):**
    *   Pros: Optimal performance and full native API access for each platform.
    *   Cons: Requires separate codebases and development efforts for iOS and Android, significantly increasing development time and complexity.
3.  **React Native with Expo:**
    *   Pros:
        *   Cross-platform development from a single JavaScript/TypeScript codebase.
        *   Large community and rich ecosystem of libraries (gestures, animations, audio, storage).
        *   Expo provides a managed workflow, simplifying build processes, over-the-air updates, and access to native APIs without manual linking.
        *   Good performance for 2D games of this scope.
        *   Hot reloading and fast refresh for quick development iterations.
    *   Cons:
        *   Performance might not match pure native for extremely demanding 3D games (not an issue here).
        *   Reliance on the Expo ecosystem and its release cycles for certain native features.
4.  **Other Cross-Platform Frameworks (e.g., Flutter, Unity):**
    *   Pros: Flutter offers good performance and UI. Unity is powerful for game development.
    *   Cons: Flutter (Dart) and Unity (C#) introduce different language ecosystems if the team is primarily JS/TS focused. Unity might be overkill for a simple 2D arcade game.

## Decision Outcome

**Chosen Option:** **React Native with Expo**

**Justification:**

*   **Cross-Platform Efficiency:** The ability to write once and deploy on iOS, Android, and Web from a single TypeScript codebase is a major advantage for a small project aiming for wide reach.
*   **Developer Experience:** Expo's managed workflow, extensive documentation, and features like fast refresh significantly speed up development and reduce boilerplate.
*   **Rich Ecosystem:** Libraries like `react-native-gesture-handler`, `react-native-reanimated`, `expo-av`, and `@react-native-async-storage/async-storage` provide pre-built solutions for common game development needs (input, animation, sound, local storage).
*   **Performance:** For a 2D arcade game like "Red Ball Classic," React Native's performance, especially when combined with Reanimated for animations, is more than sufficient.
*   **TypeScript Support:** Strong TypeScript support enhances code quality and maintainability.
*   **Existing Skills:** Assuming team familiarity with React/JavaScript, React Native is a natural extension.

## Consequences

*   The project will be developed using TypeScript, React Native, and the Expo SDK.
*   Dependencies on specific Expo and React Native libraries will be managed via `npm` or `yarn`.
*   Development will primarily focus on the structure and APIs provided by React Native and Expo.
*   Builds and deployments for native platforms will utilize Expo Application Services (EAS) or local Expo build commands.
*   Testing will involve tools and practices common in the React Native ecosystem (e.g., Jest, React Native Testing Library).