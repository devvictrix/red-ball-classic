// File: constants/Colors.ts

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Predefined list of soft background colors for gentle transitions
export const gentleBackgroundColorsLight = [
  '#FFFFFF', // Initial White
  '#E6E6FA', // Lavender
  '#FFFACD', // LemonChiffon
  '#AFEEEE', // PaleTurquoise
  '#FFE4E1', // MistyRose
];

export const gentleBackgroundColorsDark = [
  '#34495E', // Initial Dark Slate Blue
  '#483D8B', // DarkSlateBlue (slightly different for variety)
  '#2F4F4F', // DarkSlateGray
  '#5F9EA0', // CadetBlue
  '#6A5ACD', // SlateBlue
];


export const Colors = {
  light: {
    text: '#333333',
    background: '#F0F8FF',
    tint: tintColorLight,
    icon: '#595959',
    tabIconDefault: '#8c8c8c',
    tabIconSelected: tintColorLight,
    // --- Game Colors (Light Theme - Playful Discovery) ---
    gameBackground: '#F0F8FF',
    gameAreaBackground: gentleBackgroundColorsLight[0], // Use the first from the list
    gamePrimary: '#FF6347',
    gameSecondary: '#1E90FF',
    gameAccent: '#FFD700',
    gameTargetColor1: '#FFD700',
    gameTargetColor2: '#32CD32',
    gameTargetColor3: '#FF69B4',
    gameTargetColor4: '#00CED1',
    gameText: '#333333',
    gameBorder: '#ADD8E6',
    gameButtonBackground: '#1E90FF',
    gameButtonText: '#FFFFFF',
  },
  dark: {
    text: '#E0E0E0',
    background: '#2C3E50',
    tint: tintColorDark,
    icon: '#B0B0B0',
    tabIconDefault: '#7f7f7f',
    tabIconSelected: tintColorDark,
    // --- Game Colors (Dark Theme - Playful Discovery) ---
    gameBackground: '#2C3E50',
    gameAreaBackground: gentleBackgroundColorsDark[0], // Use the first from the list
    gamePrimary: '#FF8A65',
    gameSecondary: '#4FC3F7',
    gameAccent: '#FFEE58',
    gameTargetColor1: '#FFEE58',
    gameTargetColor2: '#81C784',
    gameTargetColor3: '#F06292',
    gameTargetColor4: '#4DD0E1',
    gameText: '#E0E0E0',
    gameBorder: '#5D6D7E',
    gameButtonBackground: '#4FC3F7',
    gameButtonText: '#2C3E50',
  },
};