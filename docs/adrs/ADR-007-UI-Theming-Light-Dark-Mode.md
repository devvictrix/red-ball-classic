// File: docs/adrs/ADR-007-UI-Theming-Light-Dark-Mode.md

# ADR-007: UI Theming (Light/Dark Mode)

*   **Status:** Approved
*   **Date:** 2025-05-13 (Assumed)
*   **Deciders:** DevLead

## Context and Problem Statement

Modern mobile applications often support light and dark color schemes to respect user preferences and improve visual comfort in different lighting conditions. "Red Ball Classic" should provide a pleasant visual experience by adapting its UI colors to the system's current theme.

## Considered Options

1.  **Manual Theme Switching Logic with `Appearance` API:**
    *   Pros: No external libraries needed beyond React Native's `Appearance` module to detect system theme changes.
    *   Cons: Requires writing custom logic to manage theme state, propagate theme changes (e.g., via Context or prop drilling), and select colors manually throughout the app. Can become verbose.
2.  **Expo's Recommended Approach (`useColorScheme` Hook, Theme-aware Components/Hooks):**
    *   Pros:
        *   `useColorScheme()` hook (from `react-native` or `expo-constants` for web hydration) provides easy access to the current color scheme ('light', 'dark', or null).
        *   Encourages defining color palettes (e.g., in `constants/Colors.ts`) for both light and dark modes.
        *   Custom hooks (like `useThemeColor`) can be created to simplify accessing theme-specific colors within components.
        *   Components like `ThemedText` and `ThemedView` (provided in Expo starter templates) encapsulate theme-aware styling.
    *   Cons: Relies on adhering to a pattern of using these hooks/components.
3.  **Third-party Theming Libraries (e.g., React Navigation Theming, Restyle):**
    *   Pros: Often provide more comprehensive theming solutions, including support for custom themes beyond just light/dark, and utilities for typed theme styles.
    *   Cons: Adds external dependencies. Might be overkill for simple light/dark mode adaptation if not needing advanced theming features.

## Decision Outcome

**Chosen Option:** **Expo's Recommended Approach (using `useColorScheme` hook, `constants/Colors.ts`, and custom `useThemeColor` utility hook).**

**Justification:**

*   **Simplicity and Integration:** This approach is well-integrated with the Expo and React Native ecosystem. The `useColorScheme` hook is a standard way to detect the active theme.
*   **Maintainability:** Centralizing color definitions in `constants/Colors.ts` makes it easy to manage and update color palettes. The `useThemeColor` hook provides a clean abstraction for components to consume these themed colors.
*   **Developer Experience:** The pattern of `ThemedText` and `ThemedView` (or applying `useThemeColor` directly) is straightforward for developers to use.
*   **Sufficient for Needs:** For adapting to system light/dark modes, this approach is sufficient without requiring the complexity of a full third-party theming library.
*   **Expo Starter Template:** This pattern is often demonstrated in Expo starter templates, making it familiar.

## Consequences

*   A `constants/Colors.ts` file defines color objects for `light` and `dark` themes. Each theme object contains key-value pairs for various color roles (e.g., `text`, `background`, `gamePrimary`, `gameAccent`).
*   The `useColorScheme()` hook (from `react-native`, with web considerations if needed) is used to get the current theme preference.
*   A custom hook `hooks/useThemeColor.ts` is implemented. It takes a color name (key from `Colors.ts`) and optional specific light/dark overrides, returning the appropriate color value for the current theme.
*   Components in `app/(tabs)/game.tsx` and elsewhere use `useThemeColor` to dynamically set colors for text, backgrounds, game elements (ball, paddle), borders, and UI overlays.
*   Example: `const ballColor = useThemeColor({}, 'gamePrimary');`
*   This ensures that the game's visual appearance automatically adapts when the user changes their system's light/dark mode settings.