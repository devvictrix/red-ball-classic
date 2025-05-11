// File: constants/Colors.ts

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // --- Game Colors (Light Theme) ---
    // Brighter, classic, but less neon for light mode
    gameBackground: '#ECEFF1', // Light bluish grey
    gameAreaBackground: '#FFFFFF', // White game area
    gamePrimary: '#E53935',     // Bright Red (Ball)
    gameSecondary: '#1E88E5',   // Bright Blue (Paddle)
    gameAccent: '#00ACC1',      // Bright Cyan (Score/UI Accents)
    gameText: '#263238',        // Dark Blue Grey (Text)
    gameBorder: '#546E7A',      // Blue Grey (Borders)
    gameButtonBackground: '#1E88E5',
    gameButtonText: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718', // Original dark background, good for contrast
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // --- Game Colors (Dark Theme - "Very Cool" Retro/Neon) ---
    gameBackground: '#0D0D1A',      // Very dark deep blue/purple (Screen BG)
    gameAreaBackground: '#1A1A2F',  // Darker blue, for the game play area itself
    gamePrimary: '#FF3366',         // Neon Pink/Red (Ball)
    gameSecondary: '#00E5FF',       // Neon Cyan (Paddle)
    gameAccent: '#FFFF66',          // Neon Yellow (Score/UI Accents)
    gameText: '#E0E0FF',            // Light lavender/off-white (Text)
    gameBorder: '#66FFCC',          // Neon Mint/Teal (Borders)
    gameButtonBackground: 'transparent', // Transparent for bordered button
    gameButtonText: '#FFFF66',       // Neon Yellow for button text
  },
};