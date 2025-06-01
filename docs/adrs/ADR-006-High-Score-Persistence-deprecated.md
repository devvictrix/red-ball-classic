// File: docs/adrs/ADR-006-High-Score-Persistence.md

# ADR-006: High Score Persistence

*   **Status:** Approved
*   **Date:** 2025-05-12 (Assumed)
*   **Deciders:** DevLead

## Context and Problem Statement

To enhance replayability and player motivation in "Red Ball Classic" (`FR-SCORE-02`), the game needs to store the player's highest score locally on their device. This high score should be loaded when the game starts and displayed to the player (e.g., on the start screen or game over screen).

## Considered Options

1.  **`@react-native-async-storage/async-storage`:**
    *   Pros: The community-recommended standard for simple, unencrypted, asynchronous, persistent key-value storage in React Native. Easy to use API (`getItem`, `setItem`, `removeItem`). Works across iOS, Android, and Web (with polyfills or browser localStorage).
    *   Cons: Storage is asynchronous, requiring `async/await` or Promises. Data is not encrypted (not an issue for a simple high score).
2.  **Expo SecureStore (`expo-secure-store`):**
    *   Pros: Provides encrypted storage.
    *   Cons: Overkill for a non-sensitive piece of data like a high score. Primarily intended for storing sensitive information like tokens or credentials.
3.  **SQLite (e.g., via `expo-sqlite`):**
    *   Pros: A full relational database, suitable for complex structured data.
    *   Cons: Massive overkill for storing a single high score value. Introduces significant complexity in setup and usage (SQL queries, schema management).
4.  **State-only (No Persistence):**
    *   Pros: Simplest to implement (just a React state variable).
    *   Cons: High score is lost when the app is closed, failing to meet `FR-SCORE-02`.

## Decision Outcome

**Chosen Option:** **`@react-native-async-storage/async-storage`**

**Justification:**

*   **Simplicity and Suitability:** For storing a single numerical value (the high score), `AsyncStorage` provides the simplest and most appropriate mechanism. Its key-value API is perfectly suited for this use case.
*   **Community Standard:** It's the widely adopted solution for basic local persistence in React Native.
*   **Cross-Platform:** Works effectively across the target platforms (iOS, Android, Web).
*   **Asynchronous Nature:** While asynchronous, this is generally not an issue for loading/saving a high score, which doesn't need to be a blocking operation for the UI. `async/await` makes handling this straightforward.
*   **No Encryption Needed:** The high score is not sensitive data, so the encryption features of `SecureStore` are unnecessary.
*   **Lightweight:** Avoids the overhead and complexity of a full database solution like SQLite.

## Consequences

*   The project has a dependency on `@react-native-async-storage/async-storage`.
*   A constant key (e.g., `HIGH_SCORE_KEY = "RedBallClassic_HighScore"`) is defined for storing and retrieving the high score.
*   In `GameScreen` (`app/(tabs)/game.tsx`):
    *   A `useEffect` hook runs on component mount to call a `loadHighScore` function.
    *   `loadHighScore`: Asynchronously retrieves the score string from `AsyncStorage` using `await AsyncStorage.getItem(HIGH_SCORE_KEY)`. If a value exists, it's parsed to an integer and set to the `highScore` state.
    *   A `saveHighScore(newScore)` function: Asynchronously saves the `newScore` (converted to a string) to `AsyncStorage` using `await AsyncStorage.setItem(HIGH_SCORE_KEY, newScore.toString())`. This function also updates the `highScore` state.
    *   `saveHighScore` is called during the game over sequence if the current `score` exceeds the existing `highScore`.
*   Error handling (`try-catch`) is implemented for `AsyncStorage` operations to gracefully handle potential issues.