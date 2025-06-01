// File: constants/Colors.ts
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
    // --- Game Colors (Light Theme - Arcade) ---
    gameBackground: '#ECEFF1',
    gameAreaBackground: '#FFFFFF',
    gamePrimary: '#E53935',     // Ball
    gameSecondary: '#1E88E5',   // Paddle
    gameAccent: '#00ACC1',      // Score/UI
    gameText: '#263238',
    gameBorder: '#546E7A',
    gameButtonBackground: '#1E88E5',
    gameButtonText: '#FFFFFF',
    // Brick Colors (example for arcade)
    brickColor1: '#FF7043',
    brickColor2: '#FFEE58',
    brickColor3: '#66BB6A',
    brickColor4: '#42A5F5',
    brickColor5: '#AB47BC',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // --- Game Colors (Dark Theme - Arcade Neon) ---
    gameBackground: '#0D0D1A',
    gameAreaBackground: '#1A1A2F',
    gamePrimary: '#FF3366',         // Ball
    gameSecondary: '#00E5FF',       // Paddle
    gameAccent: '#FFFF66',          // Score/UI
    gameText: '#E0E0FF',
    gameBorder: '#66FFCC',
    gameButtonBackground: '#00E5FF',
    gameButtonText: '#0D0D1A',
    // Brick Colors (example - neon for arcade)
    brickColor1: '#F44336',
    brickColor2: '#FF9800',
    brickColor3: '#4CAF50',
    brickColor4: '#2196F3',
    brickColor5: '#9C27B0',
  },
};