// File: constants/gameConstants.ts

// --- Core Playful Discovery Constants ---
export const BALL_RADIUS = 20; // Larger, more visible ball
export const PADDLE_WIDTH = 120; // Wider, easier to hit paddle
export const PADDLE_HEIGHT = 25; // Thicker paddle
export const PADDLE_Y_OFFSET = 70; // Distance from bottom

// Gentle Ball Speeds
export const INITIAL_BALL_SPEED_X_GENTLE = 1.5; // Very slow horizontal start
export const INITIAL_BALL_SPEED_Y_GENTLE = -2.0; // Very slow upward start
export const MAX_BALL_SPEED_GENTLE = 3; // Capped at a very gentle speed

// Interactive Targets
export const TARGET_SIZE_DEFAULT = 50; // Diameter or width/height for simple shapes
export const TARGET_PADDING = 15;
export const TARGET_OFFSET_TOP = 60;
export const MAX_TARGETS_ON_SCREEN = 3; // Start with few targets

// Game Area & Layout
export const GAME_ASPECT_RATIO_VALUE = 3 / 4; // Can remain, or adjust for more vertical space
export const WEB_GAME_AREA_WIDTH = 375; // Can remain

// --- Deprecated Constants (from "Arcade Escalator") ---
// export const INITIAL_BALL_SPEED_X = 3;
// ... (rest of deprecated constants remain commented out)