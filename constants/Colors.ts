// File: constants/Colors.ts

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

const tintColorLight = '#0a7ea4'; // Standard tint, can be kept for system UI
const tintColorDark = '#fff';   // Standard tint

// Child-Friendly Palette for "Playful Discovery"
// Focus: Bright, soft, cheerful, clear, and inviting. Good contrast.

export const Colors = {
  light: {
    text: '#333333', // Dark grey for good readability
    background: '#F0F8FF', // Alice Blue - very light, soft blue
    tint: tintColorLight,
    icon: '#595959',
    tabIconDefault: '#8c8c8c',
    tabIconSelected: tintColorLight,
    // --- Game Colors (Light Theme - Playful Discovery) ---
    gameBackground: '#F0F8FF',      // Consistent with app background
    gameAreaBackground: '#FFFFFF',  // Clean white for play area
    gamePrimary: '#FF6347',         // Tomato Red (Friendly Ball)
    gameSecondary: '#1E90FF',       // Dodger Blue (Friendly Paddle)
    gameAccent: '#FFD700',          // Gold (Interactive Targets, Highlights)
    gameTargetColor1: '#FFD700',    // Gold
    gameTargetColor2: '#32CD32',    // Lime Green
    gameTargetColor3: '#FF69B4',    // Hot Pink
    gameTargetColor4: '#00CED1',    // Dark Turquoise
    gameText: '#333333',            // Dark Grey for overlay text
    gameBorder: '#ADD8E6',          // Light Blue (Soft borders)
    gameButtonBackground: '#1E90FF', // Dodger Blue
    gameButtonText: '#FFFFFF',       // White
  },
  dark: {
    text: '#E0E0E0', // Light grey for readability
    background: '#2C3E50', // Dark Slate Blue - deep but not black
    tint: tintColorDark,
    icon: '#B0B0B0',
    tabIconDefault: '#7f7f7f',
    tabIconSelected: tintColorDark,
    // --- Game Colors (Dark Theme - Playful Discovery) ---
    gameBackground: '#2C3E50',      // Consistent with app background
    gameAreaBackground: '#34495E',  // Slightly lighter Slate Blue for play area
    gamePrimary: '#FF8A65',         // Lighter, softer Orange-Red (Friendly Ball)
    gameSecondary: '#4FC3F7',       // Lighter Sky Blue (Friendly Paddle)
    gameAccent: '#FFEE58',          // Bright Yellow (Interactive Targets, Highlights)
    gameTargetColor1: '#FFEE58',    // Bright Yellow
    gameTargetColor2: '#81C784',    // Light Green
    gameTargetColor3: '#F06292',    // Light Pink
    gameTargetColor4: '#4DD0E1',    // Light Cyan
    gameText: '#E0E0E0',            // Light grey for overlay text
    gameBorder: '#5D6D7E',          // Medium Grey-Blue (Soft borders)
    gameButtonBackground: '#4FC3F7', // Lighter Sky Blue
    gameButtonText: '#2C3E50',       // Dark Slate Blue (for contrast on light button)
  },
};